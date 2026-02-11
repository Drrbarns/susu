import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedSecret = Deno.env.get('CRON_SECRET');
    
    if (cronSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: job } = await supabase
      .from('background_jobs')
      .insert({
        job_type: 'sms_retry',
        status: 'running',
        scheduled_for: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const jobId = job.id;
    let retriedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    try {
      // Get failed SMS that haven't exceeded max retries
      const { data: failedSMS, error: failedError } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('status', 'failed')
        .lt('retry_count', 3) // max_retries
        .order('created_at', { ascending: true })
        .limit(100); // Process 100 at a time

      if (failedError) throw failedError;

      for (const sms of failedSMS || []) {
        retriedCount++;

        // Exponential backoff: wait 5min, 15min, 45min
        const minutesSinceLastAttempt = (Date.now() - new Date(sms.updated_at).getTime()) / 1000 / 60;
        const requiredWait = Math.pow(3, sms.retry_count) * 5; // 5, 15, 45 minutes

        if (minutesSinceLastAttempt < requiredWait) {
          continue; // Not ready to retry yet
        }

        // Retry sending
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        
        const response = await fetch(`${supabaseUrl}/functions/v1/sms-send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: sms.user_id,
            phone_number: sms.phone_number,
            message_text: sms.message_text,
            metadata: { ...sms.metadata, retry_attempt: sms.retry_count + 1 },
          }),
        });

        const result = await response.json();

        if (result.success) {
          successCount++;
          await supabase
            .from('sms_logs')
            .update({
              status: 'sent',
              retry_count: sms.retry_count + 1,
              sent_at: new Date().toISOString(),
              error_message: null,
            })
            .eq('id', sms.id);
        } else {
          failedCount++;
          await supabase
            .from('sms_logs')
            .update({
              retry_count: sms.retry_count + 1,
              error_message: result.error,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sms.id);
        }
      }

      await supabase
        .from('background_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: {
            retried: retriedCount,
            success: successCount,
            failed: failedCount,
          },
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({
          success: true,
          job_id: jobId,
          retried: retriedCount,
          success: successCount,
          failed: failedCount,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      await supabase
        .from('background_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message,
        })
        .eq('id', jobId);

      throw error;
    }
  } catch (error) {
    console.error('Error in SMS retry job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
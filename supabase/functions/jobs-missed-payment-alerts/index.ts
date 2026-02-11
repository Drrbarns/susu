import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

async function sendSMS(supabase: any, userId: string, phoneNumber: string, templateId: string, variables: Record<string, any>, metadata: Record<string, any>) {
  try {
    const { data: template } = await supabase
      .from('sms_templates')
      .select('template_text')
      .eq('id', templateId)
      .single();

    if (!template) return { success: false, error: 'Template not found' };

    let message = template.template_text;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/sms-send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        phone_number: phoneNumber,
        template_id: templateId,
        variables,
        message_text: message,
        metadata,
      }),
    });

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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
        job_type: 'missed_payment_alerts',
        status: 'running',
        scheduled_for: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const jobId = job.id;
    let messagesSent = 0;
    let errors = 0;

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Get all overdue contributions from yesterday that haven't been paid
      const { data: overdue, error: overdueError } = await supabase
        .from('contribution_schedules')
        .select(`
          *,
          user:user_id (
            id,
            full_name,
            phone_number
          ),
          group:group_id (
            id,
            name,
            daily_amount
          )
        `)
        .eq('due_date', yesterdayStr)
        .eq('status', 'overdue');

      if (overdueError) throw overdueError;

      const { data: template } = await supabase
        .from('sms_templates')
        .select('id')
        .eq('name', 'missed_payment_alert')
        .eq('is_active', true)
        .single();

      if (!template) {
        throw new Error('Missed payment alert template not found');
      }

      for (const schedule of overdue || []) {
        if (!schedule.user?.phone_number) {
          errors++;
          continue;
        }

        const { data: optOut } = await supabase
          .from('sms_opt_outs')
          .select('*')
          .eq('user_id', schedule.user_id)
          .in('opt_out_type', ['all', 'alerts'])
          .maybeSingle();

        if (optOut) continue;

        const result = await sendSMS(
          supabase,
          schedule.user_id,
          schedule.user.phone_number,
          template.id,
          {
            user_name: schedule.user.full_name?.split(' ')[0] || 'Member',
            amount: schedule.amount,
            group_name: schedule.group?.name || 'your group',
            due_date: yesterdayStr,
          },
          {
            schedule_id: schedule.id,
            group_id: schedule.group_id,
            job_id: jobId,
          }
        );

        if (result.success) {
          messagesSent++;
        } else {
          errors++;
        }
      }

      await supabase
        .from('background_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: {
            messages_sent: messagesSent,
            errors: errors,
            total_overdue: overdue?.length || 0,
          },
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({
          success: true,
          job_id: jobId,
          messages_sent: messagesSent,
          errors: errors,
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
    console.error('Error in missed payment alerts job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
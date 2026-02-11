import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// Helper to send SMS
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

    // Call SMS send function
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
    // Verify cron secret
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

    // Create job record
    const { data: job } = await supabase
      .from('background_jobs')
      .insert({
        job_type: 'daily_reminders',
        status: 'running',
        scheduled_for: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const jobId = job.id;
    let messagesSent = 0;
    let errors = 0;
    const errorDetails: any[] = [];

    try {
      // Get today's date in Ghana timezone
      const today = new Date().toISOString().split('T')[0];

      // Get all contributions due today
      const { data: dueToday, error: dueError } = await supabase
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
        .eq('due_date', today)
        .in('status', ['pending', 'overdue']);

      if (dueError) throw dueError;

      // Get the daily reminder template
      const { data: template } = await supabase
        .from('sms_templates')
        .select('id')
        .eq('name', 'daily_due_reminder')
        .eq('is_active', true)
        .single();

      if (!template) {
        throw new Error('Daily reminder template not found or inactive');
      }

      // Send SMS to each user
      for (const schedule of dueToday || []) {
        if (!schedule.user?.phone_number) {
          errors++;
          continue;
        }

        // Check if user has opted out
        const { data: optOut } = await supabase
          .from('sms_opt_outs')
          .select('*')
          .eq('user_id', schedule.user_id)
          .in('opt_out_type', ['all', 'reminders'])
          .maybeSingle();

        if (optOut) {
          continue; // Skip opted-out users
        }

        const result = await sendSMS(
          supabase,
          schedule.user_id,
          schedule.user.phone_number,
          template.id,
          {
            user_name: schedule.user.full_name?.split(' ')[0] || 'Member',
            amount: schedule.amount,
            group_name: schedule.group?.name || 'your group',
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
          errorDetails.push({
            user_id: schedule.user_id,
            phone: schedule.user.phone_number,
            error: result.error,
          });
        }
      }

      // Update job as completed
      await supabase
        .from('background_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: {
            messages_sent: messagesSent,
            errors: errors,
            error_details: errorDetails.slice(0, 10), // Keep first 10 errors
            total_due_today: dueToday?.length || 0,
          },
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({
          success: true,
          job_id: jobId,
          messages_sent: messagesSent,
          errors: errors,
          total_due_today: dueToday?.length || 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      // Update job as failed
      await supabase
        .from('background_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message,
          result: {
            messages_sent: messagesSent,
            errors: errors,
          },
        })
        .eq('id', jobId);

      throw error;
    }
  } catch (error) {
    console.error('Error in daily reminders job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
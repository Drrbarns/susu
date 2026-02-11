
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { 
      schedule_id, 
      payment_method, 
      payment_transaction_id,
      wallet_transaction_id,
      notes 
    } = body;

    if (!schedule_id || !payment_method) {
      return new Response(
        JSON.stringify({ error: 'schedule_id and payment_method are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('contribution_schedules')
      .select('*, groups:group_id(daily_amount, status)')
      .eq('id', schedule_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (scheduleError || !schedule) {
      return new Response(
        JSON.stringify({ error: 'Schedule not found or unauthorized' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (schedule.status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Contribution already paid' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate if late and late fee
    const now = new Date();
    const dueDate = new Date(schedule.due_date);
    const isLate = now > dueDate;
    const gracePeriodEnds = schedule.grace_period_ends_at 
      ? new Date(schedule.grace_period_ends_at) 
      : null;
    const withinGracePeriod = gracePeriodEnds && now < gracePeriodEnds;
    
    const daysLate = isLate ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const lateFee = isLate && !withinGracePeriod ? (schedule.late_fee || 0) : 0;
    const totalAmount = parseFloat(schedule.amount) + lateFee;

    // Create contribution record
    const { data: contribution, error: contributionError } = await supabase
      .from('contributions')
      .insert({
        schedule_id: schedule.id,
        group_id: schedule.group_id,
        user_id: user.id,
        membership_id: schedule.membership_id,
        amount: schedule.amount,
        late_fee: lateFee,
        total_amount: totalAmount,
        payment_method,
        payment_transaction_id,
        wallet_transaction_id,
        paid_at: now.toISOString(),
        is_late: isLate,
        days_late: daysLate,
        notes,
      })
      .select()
      .maybeSingle();

    if (contributionError) throw contributionError;

    // Update schedule status
    const { error: updateError } = await supabase
      .from('contribution_schedules')
      .update({
        status: 'paid',
        paid_at: now.toISOString(),
        paid_amount: totalAmount,
        payment_method,
        transaction_id: payment_transaction_id || wallet_transaction_id,
        is_late: isLate,
        late_fee: lateFee,
        updated_at: now.toISOString(),
      })
      .eq('id', schedule_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        contribution,
        message: 'Contribution marked as paid successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error marking contribution as paid:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

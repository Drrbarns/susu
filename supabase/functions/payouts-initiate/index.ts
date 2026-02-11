
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

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!userData || !['super_admin', 'admin'].includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { schedule_id, notes } = body;

    if (!schedule_id) {
      return new Response(
        JSON.stringify({ error: 'schedule_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the payout schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('payout_schedules')
      .select(`
        *,
        groups:group_id (
          id,
          name,
          payout_amount,
          status
        ),
        users:user_id (
          id,
          full_name,
          phone,
          momo_number
        )
      `)
      .eq('id', schedule_id)
      .maybeSingle();

    if (scheduleError || !schedule) {
      return new Response(
        JSON.stringify({ error: 'Payout schedule not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (schedule.status !== 'scheduled') {
      return new Response(
        JSON.stringify({ error: `Payout already ${schedule.status}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if group is active
    if (schedule.groups?.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Group is not active' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = new Date();

    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        schedule_id: schedule.id,
        group_id: schedule.group_id,
        user_id: schedule.user_id,
        membership_id: schedule.membership_id,
        turn_position: schedule.turn_position,
        amount: schedule.amount,
        status: 'initiated',
        recipient_momo_number: schedule.users?.momo_number,
        initiated_at: now.toISOString(),
        initiated_by: user.id,
        notes,
      })
      .select()
      .maybeSingle();

    if (payoutError) throw payoutError;

    // Update schedule status
    const { error: updateError } = await supabase
      .from('payout_schedules')
      .update({
        status: 'initiated',
        initiated_at: now.toISOString(),
        initiated_by: user.id,
        updated_at: now.toISOString(),
      })
      .eq('id', schedule_id);

    if (updateError) throw updateError;

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'payout_initiated',
      resource_type: 'payout',
      resource_id: payout.id,
      details: {
        schedule_id,
        group_id: schedule.group_id,
        recipient_id: schedule.user_id,
        amount: schedule.amount,
        turn_position: schedule.turn_position,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        payout,
        message: 'Payout initiated successfully. Awaiting approval.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error initiating payout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

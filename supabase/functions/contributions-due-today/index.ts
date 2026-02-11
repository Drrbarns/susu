
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

    const today = new Date().toISOString().split('T')[0];

    // Get all contribution schedules due today for this user
    const { data: schedules, error: schedulesError } = await supabase
      .from('contribution_schedules')
      .select(`
        *,
        groups:group_id (
          id,
          name,
          daily_amount,
          status,
          group_type
        ),
        group_memberships:membership_id (
          id,
          status,
          turn_position
        )
      `)
      .eq('user_id', user.id)
      .eq('due_date', today)
      .in('status', ['pending', 'overdue']);

    if (schedulesError) throw schedulesError;

    // Calculate late fees and grace periods
    const now = new Date();
    const dueToday = schedules.map((schedule: any) => {
      const isLate = schedule.status === 'overdue';
      const gracePeriodEnds = schedule.grace_period_ends_at 
        ? new Date(schedule.grace_period_ends_at) 
        : null;
      
      const withinGracePeriod = gracePeriodEnds && now < gracePeriodEnds;
      const lateFee = isLate && !withinGracePeriod ? (schedule.late_fee || 0) : 0;

      return {
        id: schedule.id,
        group_id: schedule.group_id,
        group_name: schedule.groups?.name,
        membership_id: schedule.membership_id,
        due_date: schedule.due_date,
        amount: schedule.amount,
        late_fee: lateFee,
        total_amount: parseFloat(schedule.amount) + lateFee,
        status: schedule.status,
        is_late: isLate,
        grace_period_ends_at: schedule.grace_period_ends_at,
        within_grace_period: withinGracePeriod,
        turn_position: schedule.group_memberships?.turn_position,
        group_status: schedule.groups?.status,
      };
    });

    // Calculate total due
    const totalDue = dueToday.reduce((sum: number, item: any) => 
      sum + parseFloat(item.total_amount), 0
    );

    return new Response(
      JSON.stringify({
        due_today: dueToday,
        total_due: totalDue,
        count: dueToday.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching due today:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

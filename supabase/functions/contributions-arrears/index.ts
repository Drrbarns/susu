
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

    const url = new URL(req.url);
    const groupId = url.searchParams.get('group_id');

    const today = new Date().toISOString().split('T')[0];

    // Get all overdue contributions
    let query = supabase
      .from('contribution_schedules')
      .select(`
        *,
        groups:group_id (
          id,
          name,
          daily_amount,
          status
        ),
        group_memberships:membership_id (
          id,
          status,
          turn_position
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'overdue')
      .lt('due_date', today);

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: overdueSchedules, error: overdueError } = await query.order('due_date', { ascending: true });

    if (overdueError) throw overdueError;

    const now = new Date();
    const arrears = overdueSchedules.map((schedule: any) => {
      const dueDate = new Date(schedule.due_date);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const gracePeriodEnds = schedule.grace_period_ends_at 
        ? new Date(schedule.grace_period_ends_at) 
        : null;
      const withinGracePeriod = gracePeriodEnds && now < gracePeriodEnds;
      
      const lateFee = !withinGracePeriod ? (schedule.late_fee || 0) : 0;
      const totalAmount = parseFloat(schedule.amount) + lateFee;

      return {
        id: schedule.id,
        group_id: schedule.group_id,
        group_name: schedule.groups?.name,
        membership_id: schedule.membership_id,
        due_date: schedule.due_date,
        amount: schedule.amount,
        late_fee: lateFee,
        total_amount: totalAmount,
        days_overdue: daysOverdue,
        grace_period_ends_at: schedule.grace_period_ends_at,
        within_grace_period: withinGracePeriod,
        turn_position: schedule.group_memberships?.turn_position,
        group_status: schedule.groups?.status,
      };
    });

    // Calculate totals
    const totalArrears = arrears.reduce((sum: number, item: any) => 
      sum + parseFloat(item.total_amount), 0
    );
    const totalLateFees = arrears.reduce((sum: number, item: any) => 
      sum + parseFloat(item.late_fee), 0
    );

    // Group by group_id
    const byGroup = arrears.reduce((acc: any, item: any) => {
      if (!acc[item.group_id]) {
        acc[item.group_id] = {
          group_id: item.group_id,
          group_name: item.group_name,
          count: 0,
          total: 0,
          items: [],
        };
      }
      acc[item.group_id].count++;
      acc[item.group_id].total += parseFloat(item.total_amount);
      acc[item.group_id].items.push(item);
      return acc;
    }, {});

    return new Response(
      JSON.stringify({
        arrears,
        total_arrears: totalArrears,
        total_late_fees: totalLateFees,
        count: arrears.length,
        by_group: Object.values(byGroup),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching arrears:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

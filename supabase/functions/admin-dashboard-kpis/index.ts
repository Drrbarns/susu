import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30';
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Total members
    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member');

    // New members in period
    const { count: newMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member')
      .gte('created_at', startDate.toISOString());

    // Active groups
    const { count: activeGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total groups
    const { count: totalGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });

    // Total inflow (successful payments in period)
    const { data: inflowData } = await supabase
      .from('payment_transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    const totalInflow = inflowData?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    // Total payouts (completed in period)
    const { data: payoutData } = await supabase
      .from('payouts')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    const totalPayouts = payoutData?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

    // Pending payouts
    const { data: pendingPayoutData } = await supabase
      .from('payouts')
      .select('amount')
      .in('status', ['pending', 'approved']);

    const pendingPayouts = pendingPayoutData?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

    // Overdue contributions (due date passed, not paid)
    const today = new Date().toISOString().split('T')[0];
    const { count: overdueCount } = await supabase
      .from('contribution_schedules')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lt('due_date', today);

    // Platform profit estimate (2% of inflow)
    const estimatedProfit = totalInflow * 0.02;

    // Pending withdrawal requests
    const { count: pendingWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Pending membership requests
    const { count: pendingMemberships } = await supabase
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Recent activity (last 7 days trend)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const { data: recentPayments } = await supabase
      .from('payment_transactions')
      .select('created_at, amount')
      .eq('status', 'completed')
      .gte('created_at', last7Days.toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const dailyInflow: Record<string, number> = {};
    recentPayments?.forEach(p => {
      const day = p.created_at.split('T')[0];
      dailyInflow[day] = (dailyInflow[day] || 0) + parseFloat(p.amount);
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          members: {
            total: totalMembers || 0,
            new: newMembers || 0,
            growth: totalMembers ? ((newMembers || 0) / totalMembers * 100).toFixed(1) : '0',
          },
          groups: {
            total: totalGroups || 0,
            active: activeGroups || 0,
            activePercentage: totalGroups ? ((activeGroups || 0) / totalGroups * 100).toFixed(1) : '0',
          },
          financials: {
            totalInflow,
            totalPayouts,
            pendingPayouts,
            estimatedProfit,
            profitMargin: totalInflow ? (estimatedProfit / totalInflow * 100).toFixed(2) : '0',
          },
          alerts: {
            overdueContributions: overdueCount || 0,
            pendingWithdrawals: pendingWithdrawals || 0,
            pendingMemberships: pendingMemberships || 0,
          },
          trends: {
            dailyInflow,
          },
          period: periodDays,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Dashboard KPIs error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

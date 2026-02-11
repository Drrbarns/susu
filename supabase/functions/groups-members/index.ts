
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const groupId = url.searchParams.get('groupId');
    const status = url.searchParams.get('status');

    if (!groupId) {
      throw new Error('Group ID is required');
    }

    let query = supabaseClient
      .from('group_memberships')
      .select(`
        *,
        user:users!group_memberships_user_id_fkey(id, full_name, phone, profile_photo),
        approved_by_user:users!group_memberships_approved_by_fkey(id, full_name)
      `)
      .eq('group_id', groupId)
      .order('turn_position', { ascending: true, nullsFirst: false });

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['approved', 'active', 'completed']);
    }

    const { data: members, error } = await query;

    if (error) throw error;

    // Get contribution stats for each member
    const enrichedMembers = await Promise.all(
      members.map(async (member: any) => {
        const { data: contributions } = await supabaseClient
          .from('contribution_schedules')
          .select('status, amount, paid_amount')
          .eq('membership_id', member.id);

        const totalDue = contributions?.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) || 0;
        const totalPaid = contributions?.reduce((sum: number, c: any) => sum + parseFloat(c.paid_amount || 0), 0) || 0;
        const pendingCount = contributions?.filter((c: any) => c.status === 'pending').length || 0;
        const lateCount = contributions?.filter((c: any) => c.status === 'late').length || 0;

        return {
          ...member,
          contribution_stats: {
            total_due: totalDue,
            total_paid: totalPaid,
            pending_count: pendingCount,
            late_count: lateCount,
          },
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedMembers,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

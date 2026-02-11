
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

    if (!groupId) {
      throw new Error('Group ID is required');
    }

    // Get group details
    const { data: group, error: groupError } = await supabaseClient
      .from('groups')
      .select(`
        *,
        created_by_user:users!groups_created_by_fkey(id, full_name, phone, profile_photo)
      `)
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;
    if (!group) throw new Error('Group not found');

    // Get member count
    const { count: memberCount } = await supabaseClient
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .in('status', ['approved', 'active', 'completed']);

    // Get pending requests count
    const { count: pendingCount } = await supabaseClient
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'pending');

    // Check if current user is a member
    const authHeader = req.headers.get('Authorization');
    let userMembership = null;
    let userTurnPosition = null;

    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (user) {
        const { data: membership } = await supabaseClient
          .from('group_memberships')
          .select('*')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .maybeSingle();

        userMembership = membership;
        userTurnPosition = membership?.turn_position;
      }
    }

    const spotsLeft = group.group_size - (memberCount || 0);
    const isFull = (memberCount || 0) >= group.group_size;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...group,
          member_count: memberCount || 0,
          pending_requests: pendingCount || 0,
          spots_left: spotsLeft,
          is_full: isFull,
          can_join: !isFull && ['open', 'active'].includes(group.status),
          user_membership: userMembership,
          user_turn_position: userTurnPosition,
        },
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

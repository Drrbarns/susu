
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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { groupId } = await req.json();

    if (!groupId) {
      throw new Error('Group ID is required');
    }

    // Get membership
    const { data: membership, error: membershipError } = await supabaseClient
      .from('group_memberships')
      .select('*, group:groups(*)')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (membershipError) throw membershipError;
    if (!membership) throw new Error('You are not a member of this group');

    // Check if user can leave
    const group = membership.group;

    // Rule 1: Cannot leave if group has started and can_exit_after_start is false
    if (group.status === 'active' && !group.can_exit_after_start) {
      // Check if user has received payout
      if (!membership.has_received_payout) {
        throw new Error('You cannot leave this group until you receive your payout. This rule was set when the group started.');
      }
    }

    // Rule 2: Cannot leave if there are pending contributions
    const { data: pendingContributions } = await supabaseClient
      .from('contribution_schedules')
      .select('*')
      .eq('membership_id', membership.id)
      .in('status', ['pending', 'late']);

    if (pendingContributions && pendingContributions.length > 0) {
      throw new Error(`You have ${pendingContributions.length} pending contribution(s). Please settle all dues before leaving.`);
    }

    // Rule 3: Cannot leave if scheduled for upcoming payout
    const { data: upcomingPayout } = await supabaseClient
      .from('payout_schedules')
      .select('*')
      .eq('membership_id', membership.id)
      .in('status', ['scheduled', 'pending_approval', 'approved'])
      .maybeSingle();

    if (upcomingPayout) {
      throw new Error('You have an upcoming payout scheduled. Please wait until after your payout to leave.');
    }

    // Update membership status
    await supabaseClient
      .from('group_memberships')
      .update({
        status: 'removed',
        removed_at: new Date().toISOString(),
        removed_by: user.id,
        removal_reason: 'Member left voluntarily',
      })
      .eq('id', membership.id);

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'group_left',
      resource_type: 'group_membership',
      resource_id: membership.id,
      details: { group_id: groupId, group_name: group.name },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'You have successfully left the group',
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


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

    const { groupId, paymentProof } = await req.json();

    if (!groupId) {
      throw new Error('Group ID is required');
    }

    // Get group details
    const { data: group, error: groupError } = await supabaseClient
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;
    if (!group) throw new Error('Group not found');

    // Check if group is joinable
    if (!['open', 'active'].includes(group.status)) {
      throw new Error('This group is not accepting new members');
    }

    // Check if already a member
    const { data: existingMembership } = await supabaseClient
      .from('group_memberships')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMembership) {
      throw new Error('You are already a member of this group');
    }

    // Check if group is full
    const { count: memberCount } = await supabaseClient
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .in('status', ['approved', 'active', 'completed']);

    if ((memberCount || 0) >= group.group_size) {
      throw new Error('This group is full');
    }

    // Determine membership status based on group type
    let membershipStatus = 'pending';
    let joinFeeRequired = false;
    let autoApprove = false;

    if (group.type === 'public') {
      membershipStatus = 'approved';
      autoApprove = true;
    } else if (group.type === 'request') {
      membershipStatus = 'pending';
      joinFeeRequired = group.join_fee > 0;
    } else if (group.type === 'paid') {
      membershipStatus = 'pending';
      joinFeeRequired = true;
      if (!paymentProof && group.join_fee > 0) {
        throw new Error('Payment proof is required for paid groups');
      }
    }

    // Create membership
    const { data: membership, error: membershipError } = await supabaseClient
      .from('group_memberships')
      .insert({
        group_id: groupId,
        user_id: user.id,
        status: membershipStatus,
        join_fee_paid: !joinFeeRequired || (paymentProof ? true : false),
        join_fee_amount: group.join_fee,
        join_fee_paid_at: !joinFeeRequired || paymentProof ? new Date().toISOString() : null,
        approved_at: autoApprove ? new Date().toISOString() : null,
        joined_at: autoApprove ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (membershipError) throw membershipError;

    // If auto-approved, assign turn position
    if (autoApprove) {
      const { data: maxPosition } = await supabaseClient
        .from('group_memberships')
        .select('turn_position')
        .eq('group_id', groupId)
        .not('turn_position', 'is', null)
        .order('turn_position', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextPosition = (maxPosition?.turn_position || 0) + 1;

      await supabaseClient
        .from('group_memberships')
        .update({ turn_position: nextPosition })
        .eq('id', membership.id);

      // Generate contribution schedules if group is active
      if (group.status === 'active' && group.start_date) {
        await generateContributionSchedules(supabaseClient, group, membership.id, user.id);
      }
    }

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: autoApprove ? 'group_joined' : 'group_join_requested',
      resource_type: 'group_membership',
      resource_id: membership.id,
      details: { group_id: groupId, group_name: group.name, type: group.type },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: membership,
        message: autoApprove 
          ? 'Successfully joined the group!' 
          : 'Join request submitted. Waiting for admin approval.',
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

async function generateContributionSchedules(supabaseClient: any, group: any, membershipId: string, userId: string) {
  const startDate = new Date(group.start_date);
  const schedules = [];

  for (let i = 0; i < group.group_size; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + i);

    schedules.push({
      group_id: group.id,
      user_id: userId,
      membership_id: membershipId,
      due_date: dueDate.toISOString().split('T')[0],
      amount: group.daily_amount,
      status: 'pending',
      grace_period_ends_at: new Date(dueDate.getTime() + group.grace_period_hours * 60 * 60 * 1000).toISOString(),
    });
  }

  await supabaseClient.from('contribution_schedules').insert(schedules);
}

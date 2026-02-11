
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

    // Check if user is admin
    const { data: adminUser } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser || !['super_admin', 'admin'].includes(adminUser.role)) {
      throw new Error('Only admins can approve members');
    }

    const { membershipId, action } = await req.json();

    if (!membershipId || !action) {
      throw new Error('Membership ID and action are required');
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new Error('Action must be approve or reject');
    }

    // Get membership details
    const { data: membership, error: membershipError } = await supabaseClient
      .from('group_memberships')
      .select('*, group:groups(*)')
      .eq('id', membershipId)
      .single();

    if (membershipError) throw membershipError;
    if (!membership) throw new Error('Membership not found');

    if (membership.status !== 'pending') {
      throw new Error('Only pending memberships can be approved or rejected');
    }

    if (action === 'reject') {
      // Reject membership
      await supabaseClient
        .from('group_memberships')
        .update({
          status: 'removed',
          removed_at: new Date().toISOString(),
          removed_by: user.id,
          removal_reason: 'Application rejected by admin',
        })
        .eq('id', membershipId);

      await supabaseClient.from('audit_logs').insert({
        user_id: user.id,
        action: 'membership_rejected',
        resource_type: 'group_membership',
        resource_id: membershipId,
        details: { group_id: membership.group_id, member_id: membership.user_id },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Membership rejected',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Approve membership
    // Check if group is full
    const { count: memberCount } = await supabaseClient
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', membership.group_id)
      .in('status', ['approved', 'active', 'completed']);

    if ((memberCount || 0) >= membership.group.group_size) {
      throw new Error('Group is full');
    }

    // Get next turn position
    const { data: maxPosition } = await supabaseClient
      .from('group_memberships')
      .select('turn_position')
      .eq('group_id', membership.group_id)
      .not('turn_position', 'is', null)
      .order('turn_position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPosition = (maxPosition?.turn_position || 0) + 1;

    // Update membership
    await supabaseClient
      .from('group_memberships')
      .update({
        status: 'approved',
        turn_position: nextPosition,
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        joined_at: new Date().toISOString(),
      })
      .eq('id', membershipId);

    // Generate contribution schedules if group is active
    if (membership.group.status === 'active' && membership.group.start_date) {
      await generateContributionSchedules(
        supabaseClient,
        membership.group,
        membershipId,
        membership.user_id
      );
    }

    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'membership_approved',
      resource_type: 'group_membership',
      resource_id: membershipId,
      details: { 
        group_id: membership.group_id, 
        member_id: membership.user_id,
        turn_position: nextPosition,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Membership approved successfully',
        data: { turn_position: nextPosition },
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

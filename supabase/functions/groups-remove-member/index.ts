
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
      throw new Error('Only admins can remove members');
    }

    const { membershipId, reason, ban } = await req.json();

    if (!membershipId) {
      throw new Error('Membership ID is required');
    }

    // Get membership
    const { data: membership } = await supabaseClient
      .from('group_memberships')
      .select('*, group:groups(*)')
      .eq('id', membershipId)
      .single();

    if (!membership) throw new Error('Membership not found');

    const newStatus = ban ? 'banned' : 'removed';

    // Update membership
    await supabaseClient
      .from('group_memberships')
      .update({
        status: newStatus,
        removed_at: new Date().toISOString(),
        removed_by: user.id,
        removal_reason: reason || (ban ? 'Banned by admin' : 'Removed by admin'),
      })
      .eq('id', membershipId);

    // If banned, also ban user from future joins
    if (ban) {
      // You could add a banned_users table or flag here
    }

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: ban ? 'member_banned' : 'member_removed',
      resource_type: 'group_membership',
      resource_id: membershipId,
      details: { 
        group_id: membership.group_id,
        member_id: membership.user_id,
        reason,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: ban ? 'Member banned successfully' : 'Member removed successfully',
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

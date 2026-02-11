
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
      throw new Error('Only admins can reorder the queue');
    }

    const { groupId, newOrder } = await req.json();

    if (!groupId || !newOrder || !Array.isArray(newOrder)) {
      throw new Error('Group ID and new order array are required');
    }

    // Get group
    const { data: group } = await supabaseClient
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (!group) throw new Error('Group not found');

    // Validate that group hasn't started or is in draft
    if (group.status === 'active') {
      throw new Error('Cannot reorder queue for active groups. Pause the group first.');
    }

    // Update turn positions
    for (let i = 0; i < newOrder.length; i++) {
      const membershipId = newOrder[i];
      await supabaseClient
        .from('group_memberships')
        .update({ turn_position: i + 1 })
        .eq('id', membershipId)
        .eq('group_id', groupId);
    }

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'queue_reordered',
      resource_type: 'group',
      resource_id: groupId,
      details: { group_name: group.name, new_order: newOrder },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Queue reordered successfully',
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

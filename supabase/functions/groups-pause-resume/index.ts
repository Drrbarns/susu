
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
      throw new Error('Only admins can pause/resume groups');
    }

    const { groupId, action, reason } = await req.json();

    if (!groupId || !action) {
      throw new Error('Group ID and action are required');
    }

    if (!['pause', 'resume'].includes(action)) {
      throw new Error('Action must be pause or resume');
    }

    // Get group
    const { data: group } = await supabaseClient
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (!group) throw new Error('Group not found');

    let newStatus;
    let actionText;

    if (action === 'pause') {
      if (group.status !== 'active') {
        throw new Error('Only active groups can be paused');
      }
      newStatus = 'paused';
      actionText = 'paused';
    } else {
      if (group.status !== 'paused') {
        throw new Error('Only paused groups can be resumed');
      }
      newStatus = 'active';
      actionText = 'resumed';
    }

    // Update group status
    await supabaseClient
      .from('groups')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId);

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: `group_${actionText}`,
      resource_type: 'group',
      resource_id: groupId,
      details: { group_name: group.name, reason },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Group ${actionText} successfully`,
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

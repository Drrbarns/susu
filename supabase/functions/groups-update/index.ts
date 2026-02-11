
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
      throw new Error('Only admins can update groups');
    }

    const { groupId, ...updates } = await req.json();

    if (!groupId) {
      throw new Error('Group ID is required');
    }

    // Get existing group
    const { data: existingGroup } = await supabaseClient
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (!existingGroup) throw new Error('Group not found');

    // Prevent certain changes if group is active
    if (existingGroup.status === 'active') {
      const restrictedFields = ['group_size', 'daily_amount', 'days_per_turn', 'payout_amount'];
      for (const field of restrictedFields) {
        if (updates[field] && updates[field] !== existingGroup[field]) {
          throw new Error(`Cannot change ${field} for an active group`);
        }
      }
    }

    // Update group
    const { data: group, error: updateError } = await supabaseClient
      .from('groups')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'group_updated',
      resource_type: 'group',
      resource_id: groupId,
      details: { updates, group_name: group.name },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: group,
        message: 'Group updated successfully',
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


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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check super admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (!userData || !['super_admin', 'admin'].includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { member_id, action, reason } = await req.json();

    if (!member_id || !action || !['ban', 'unban'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'member_id and action (ban/unban) required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get member details
    const { data: member } = await supabase
      .from('users')
      .select('full_name, status')
      .eq('id', member_id)
      .single();

    if (!member) {
      return new Response(
        JSON.stringify({ error: 'Member not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newStatus = action === 'ban' ? 'banned' : 'active';

    // Update user status
    const { error: updateError } = await supabase
      .from('users')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', member_id);

    if (updateError) throw updateError;

    // If banning, suspend all active memberships
    if (action === 'ban') {
      await supabase
        .from('group_memberships')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('user_id', member_id)
        .eq('status', 'active');
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: action === 'ban' ? 'member_banned' : 'member_unbanned',
      entity_type: 'user',
      entity_id: member_id,
      details: {
        member_name: member.full_name,
        admin_name: userData.full_name,
        reason: reason || null,
        previous_status: member.status,
        new_status: newStatus,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Member ${action === 'ban' ? 'banned' : 'unbanned'} successfully`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

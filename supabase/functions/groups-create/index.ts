
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
      throw new Error('Only admins can create groups');
    }

    const groupData = await req.json();

    // Validate required fields
    const required = ['name', 'type', 'group_size', 'daily_amount', 'days_per_turn', 'payout_amount'];
    for (const field of required) {
      if (!groupData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate type
    if (!['public', 'request', 'paid'].includes(groupData.type)) {
      throw new Error('Type must be public, request, or paid');
    }

    // Validate numbers
    if (groupData.group_size <= 0) throw new Error('Group size must be positive');
    if (groupData.daily_amount <= 0) throw new Error('Daily amount must be positive');
    if (groupData.days_per_turn <= 0) throw new Error('Days per turn must be positive');
    if (groupData.payout_amount <= 0) throw new Error('Payout amount must be positive');

    // Create group
    const { data: group, error: groupError } = await supabaseClient
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        type: groupData.type,
        group_size: groupData.group_size,
        join_fee: groupData.join_fee || 0,
        daily_amount: groupData.daily_amount,
        days_per_turn: groupData.days_per_turn,
        payout_amount: groupData.payout_amount,
        start_date: groupData.start_date,
        status: groupData.status || 'draft',
        rules_text: groupData.rules_text,
        penalty_rules: groupData.penalty_rules || {},
        min_balance: groupData.min_balance || 0,
        allowed_payment_methods: groupData.allowed_payment_methods || ['momo', 'card', 'cash'],
        grace_period_hours: groupData.grace_period_hours || 24,
        late_fee: groupData.late_fee || 0,
        can_exit_after_start: groupData.can_exit_after_start || false,
        auto_skip_on_suspension: groupData.auto_skip_on_suspension !== false,
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'group_created',
      resource_type: 'group',
      resource_id: group.id,
      details: { group_name: group.name, type: group.type },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: group,
        message: 'Group created successfully',
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


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

    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['super_admin', 'admin', 'support'].includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select(`
        id,
        full_name,
        phone,
        email,
        status,
        role,
        created_at,
        last_login_at,
        kyc_profiles (
          verification_status,
          id_type
        ),
        wallets (
          balance
        )
      `, { count: 'exact' })
      .eq('role', 'member')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: members, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    // Get group membership counts for each member
    const memberIds = members?.map(m => m.id) || [];
    const { data: memberships } = await supabase
      .from('group_memberships')
      .select('user_id, status')
      .in('user_id', memberIds);

    const membershipCounts: Record<string, { active: number; total: number }> = {};
    memberships?.forEach(m => {
      if (!membershipCounts[m.user_id]) {
        membershipCounts[m.user_id] = { active: 0, total: 0 };
      }
      membershipCounts[m.user_id].total++;
      if (m.status === 'active') {
        membershipCounts[m.user_id].active++;
      }
    });

    const enrichedMembers = members?.map(member => ({
      ...member,
      wallet_balance: member.wallets?.[0]?.balance || '0',
      kyc_status: member.kyc_profiles?.[0]?.verification_status || 'not_submitted',
      groups: membershipCounts[member.id] || { active: 0, total: 0 },
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedMembers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
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


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

    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const minAmount = url.searchParams.get('minAmount');
    const maxAmount = url.searchParams.get('maxAmount');
    const minDays = url.searchParams.get('minDays');
    const maxDays = url.searchParams.get('maxDays');
    const search = url.searchParams.get('search');

    let query = supabaseClient
      .from('groups')
      .select(`
        *,
        created_by_user:users!groups_created_by_fkey(id, full_name, phone),
        memberships:group_memberships(count)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    } else {
      // Default: show open and active groups
      query = query.in('status', ['open', 'active']);
    }

    if (minAmount) {
      query = query.gte('daily_amount', parseFloat(minAmount));
    }

    if (maxAmount) {
      query = query.lte('daily_amount', parseFloat(maxAmount));
    }

    if (minDays) {
      query = query.gte('days_per_turn', parseInt(minDays));
    }

    if (maxDays) {
      query = query.lte('days_per_turn', parseInt(maxDays));
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: groups, error } = await query;

    if (error) throw error;

    // Calculate member counts and availability
    const enrichedGroups = groups.map((group: any) => {
      const memberCount = group.memberships?.[0]?.count || 0;
      const spotsLeft = group.group_size - memberCount;
      const isFull = memberCount >= group.group_size;

      return {
        ...group,
        member_count: memberCount,
        spots_left: spotsLeft,
        is_full: isFull,
        can_join: !isFull && ['open', 'active'].includes(group.status),
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedGroups,
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

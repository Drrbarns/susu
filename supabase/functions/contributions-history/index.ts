
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const groupId = url.searchParams.get('group_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get contributions
    let query = supabase
      .from('contributions')
      .select(`
        *,
        groups:group_id (
          id,
          name,
          daily_amount
        ),
        payment_transactions:payment_transaction_id (
          id,
          provider_reference,
          payment_method
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('paid_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: contributions, error: contributionsError, count } = await query;

    if (contributionsError) throw contributionsError;

    // Calculate summary stats
    const totalPaid = contributions.reduce((sum: number, c: any) => 
      sum + parseFloat(c.total_amount), 0
    );
    const totalLateFees = contributions.reduce((sum: number, c: any) => 
      sum + parseFloat(c.late_fee || 0), 0
    );
    const lateCount = contributions.filter((c: any) => c.is_late).length;

    return new Response(
      JSON.stringify({
        contributions,
        total: count,
        limit,
        offset,
        summary: {
          total_paid: totalPaid,
          total_late_fees: totalLateFees,
          late_count: lateCount,
          on_time_count: contributions.length - lateCount,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching contribution history:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

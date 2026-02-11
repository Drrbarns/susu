
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

    // Get payouts
    let query = supabase
      .from('payouts')
      .select(`
        *,
        groups:group_id (
          id,
          name,
          payout_amount
        ),
        wallet_transactions:wallet_transaction_id (
          id,
          transaction_reference,
          status
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: payouts, error: payoutsError, count } = await query;

    if (payoutsError) throw payoutsError;

    // Calculate summary stats
    const totalReceived = payouts
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
    
    const pendingAmount = payouts
      .filter((p: any) => ['pending', 'initiated', 'approved'].includes(p.status))
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    return new Response(
      JSON.stringify({
        payouts,
        total: count,
        limit,
        offset,
        summary: {
          total_received: totalReceived,
          pending_amount: pendingAmount,
          paid_count: payouts.filter((p: any) => p.status === 'paid').length,
          pending_count: payouts.filter((p: any) => ['pending', 'initiated', 'approved'].includes(p.status)).length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching payout history:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { amount, withdrawal_method, momo_number, account_name, account_number, bank_name } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!withdrawal_method || !['momo', 'bank'].includes(withdrawal_method)) {
      return new Response(JSON.stringify({ error: 'Invalid withdrawal method' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (withdrawal_method === 'momo' && !momo_number) {
      return new Response(JSON.stringify({ error: 'MoMo number required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (withdrawal_method === 'bank' && (!account_name || !account_number || !bank_name)) {
      return new Response(JSON.stringify({ error: 'Bank details required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check balance
    const balance = parseFloat(wallet.balance);
    if (balance < amount) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate fee (1% or min GHS 1)
    const fee = Math.max(1, amount * 0.01);
    const netAmount = amount - fee;

    // Create withdrawal request
    const { data: request, error: requestError } = await supabaseClient
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        wallet_id: wallet.id,
        amount,
        fee,
        net_amount: netAmount,
        withdrawal_method,
        momo_number,
        account_name,
        account_number,
        bank_name,
        status: 'pending',
      })
      .select()
      .single();

    if (requestError) {
      console.error('Request creation error:', requestError);
      return new Response(JSON.stringify({ error: 'Failed to create withdrawal request' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update wallet pending balance
    await supabaseClient
      .from('wallets')
      .update({
        pending_balance: parseFloat(wallet.pending_balance) + amount,
      })
      .eq('id', wallet.id);

    return new Response(JSON.stringify({
      ...request,
      message: 'Withdrawal request submitted successfully. It will be reviewed within 24 hours.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
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

    const { payment_intent_id, provider_reference } = await req.json();

    if (!payment_intent_id && !provider_reference) {
      return new Response(JSON.stringify({ error: 'Payment intent ID or provider reference required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get payment intent
    let query = supabaseClient.from('payment_intents').select('*');
    if (payment_intent_id) {
      query = query.eq('id', payment_intent_id);
    } else {
      query = query.eq('provider_reference', provider_reference);
    }

    const { data: intent, error: intentError } = await query.eq('user_id', user.id).maybeSingle();

    if (intentError || !intent) {
      return new Response(JSON.stringify({ error: 'Payment intent not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If already completed, return existing transaction
    if (intent.status === 'completed') {
      const { data: transaction } = await supabaseClient
        .from('payment_transactions')
        .select('*')
        .eq('payment_intent_id', intent.id)
        .maybeSingle();

      return new Response(JSON.stringify({
        status: 'completed',
        intent,
        transaction,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if expired
    if (new Date(intent.expires_at) < new Date()) {
      await supabaseClient
        .from('payment_intents')
        .update({ status: 'expired', failed_at: new Date().toISOString() })
        .eq('id', intent.id);

      return new Response(JSON.stringify({
        status: 'expired',
        error: 'Payment intent has expired',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify with provider (placeholder - requires actual API integration)
    let providerStatus = 'pending';
    let providerTransactionId = null;

    if (intent.provider === 'hubtel') {
      // Simulate Hubtel verification
      providerStatus = 'success';
      providerTransactionId = `HUB-TXN-${Date.now()}`;
    } else if (intent.provider === 'paystack') {
      // Simulate Paystack verification
      providerStatus = 'success';
      providerTransactionId = `PAY-TXN-${Date.now()}`;
    } else if (intent.provider === 'manual') {
      // Manual payments need admin approval
      providerStatus = 'pending_approval';
    }

    if (providerStatus === 'success') {
      // Create payment transaction
      const transactionData: any = {
        payment_intent_id: intent.id,
        user_id: user.id,
        amount: intent.amount,
        fee: 0, // Calculate based on provider fees
        net_amount: intent.amount,
        currency: intent.currency,
        payment_method: intent.payment_method,
        provider: intent.provider,
        provider_transaction_id: providerTransactionId,
        provider_reference: intent.provider_reference,
        status: 'completed',
        purpose: intent.purpose,
        metadata: intent.metadata,
        completed_at: new Date().toISOString(),
      };

      if (intent.group_id) transactionData.group_id = intent.group_id;
      if (intent.contribution_schedule_id) transactionData.contribution_schedule_id = intent.contribution_schedule_id;

      const { data: transaction, error: txError } = await supabaseClient
        .from('payment_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (txError) {
        console.error('Transaction creation error:', txError);
        return new Response(JSON.stringify({ error: 'Failed to create transaction' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update payment intent
      await supabaseClient
        .from('payment_intents')
        .update({
          status: 'completed',
          provider_payment_id: providerTransactionId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', intent.id);

      // Handle purpose-specific logic
      if (intent.purpose === 'wallet_topup') {
        // Get or create wallet
        let { data: wallet } = await supabaseClient
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!wallet) {
          const { data: newWallet } = await supabaseClient
            .from('wallets')
            .insert({ user_id: user.id })
            .select()
            .single();
          wallet = newWallet;
        }

        // Create wallet transaction
        const balanceBefore = parseFloat(wallet.balance);
        const balanceAfter = balanceBefore + parseFloat(intent.amount);

        await supabaseClient.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          user_id: user.id,
          type: 'deposit',
          amount: intent.amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          status: 'completed',
          description: 'Wallet top-up',
          reference: `TOPUP-${transaction.id}`,
          related_type: 'payment_transaction',
          related_id: transaction.id,
          completed_at: new Date().toISOString(),
        });

        // Update wallet balance
        await supabaseClient
          .from('wallets')
          .update({
            balance: balanceAfter,
            total_deposited: parseFloat(wallet.total_deposited) + parseFloat(intent.amount),
            last_transaction_at: new Date().toISOString(),
          })
          .eq('id', wallet.id);
      }

      return new Response(JSON.stringify({
        status: 'completed',
        transaction,
        message: 'Payment verified successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      status: providerStatus,
      intent,
      message: providerStatus === 'pending_approval' ? 'Payment pending admin approval' : 'Payment verification pending',
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
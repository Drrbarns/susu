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

    // Check admin role
    const { data: adminUser } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser || !['super_admin', 'admin'].includes(adminUser.role)) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { withdrawal_id, action, review_notes, rejection_reason } = await req.json();

    if (!withdrawal_id || !action || !['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawal_id)
      .maybeSingle();

    if (!withdrawal) {
      return new Response(JSON.stringify({ error: 'Withdrawal request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (withdrawal.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Withdrawal already processed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reject') {
      // Reject withdrawal
      await supabaseClient
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          review_notes,
          rejection_reason,
        })
        .eq('id', withdrawal_id);

      // Release pending balance
      const { data: wallet } = await supabaseClient
        .from('wallets')
        .select('*')
        .eq('id', withdrawal.wallet_id)
        .single();

      if (wallet) {
        await supabaseClient
          .from('wallets')
          .update({
            pending_balance: Math.max(0, parseFloat(wallet.pending_balance) - parseFloat(withdrawal.amount)),
          })
          .eq('id', wallet.id);
      }

      return new Response(JSON.stringify({
        message: 'Withdrawal request rejected',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Approve withdrawal
    const { data: wallet } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('id', withdrawal.wallet_id)
      .single();

    if (!wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check balance again
    const balance = parseFloat(wallet.balance);
    if (balance < parseFloat(withdrawal.amount)) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create wallet transaction
    const balanceBefore = balance;
    const balanceAfter = balance - parseFloat(withdrawal.amount);

    const { data: walletTx } = await supabaseClient
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: withdrawal.user_id,
        type: 'withdrawal',
        amount: withdrawal.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: 'completed',
        description: `Withdrawal to ${withdrawal.withdrawal_method}`,
        reference: `WD-${withdrawal.id}`,
        related_type: 'withdrawal_request',
        related_id: withdrawal.id,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Update wallet
    await supabaseClient
      .from('wallets')
      .update({
        balance: balanceAfter,
        pending_balance: Math.max(0, parseFloat(wallet.pending_balance) - parseFloat(withdrawal.amount)),
        total_withdrawn: parseFloat(wallet.total_withdrawn) + parseFloat(withdrawal.amount),
        last_transaction_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    // Update withdrawal request
    await supabaseClient
      .from('withdrawal_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_notes,
        processed_at: new Date().toISOString(),
        processed_by: user.id,
        wallet_transaction_id: walletTx?.id,
        provider_reference: `MANUAL-${Date.now()}`,
      })
      .eq('id', withdrawal_id);

    // Log audit
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'withdrawal_approved',
      entity_type: 'withdrawal_request',
      entity_id: withdrawal_id,
      changes: { status: 'approved', amount: withdrawal.amount },
    });

    return new Response(JSON.stringify({
      message: 'Withdrawal approved successfully',
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
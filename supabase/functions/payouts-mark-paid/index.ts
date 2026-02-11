
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

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!userData || !['super_admin', 'admin'].includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { 
      payout_id, 
      payment_method, 
      transaction_reference,
      wallet_transaction_id,
      success,
      failure_reason,
      notes 
    } = body;

    if (!payout_id || success === undefined) {
      return new Response(
        JSON.stringify({ error: 'payout_id and success are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the payout
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payout_id)
      .maybeSingle();

    if (payoutError || !payout) {
      return new Response(
        JSON.stringify({ error: 'Payout not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (payout.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: `Payout must be approved first. Current status: ${payout.status}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = new Date();
    const newStatus = success ? 'paid' : 'failed';

    // If successful, create wallet transaction for recipient
    let walletTxId = wallet_transaction_id;
    if (success && !walletTxId) {
      // Get or create wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', payout.user_id)
        .maybeSingle();

      if (wallet) {
        const balanceBefore = parseFloat(wallet.available_balance);
        const balanceAfter = balanceBefore + parseFloat(payout.amount);

        // Create wallet transaction
        const { data: walletTx } = await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            user_id: payout.user_id,
            type: 'payout',
            amount: payout.amount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            status: 'completed',
            reference_type: 'payout',
            reference_id: payout_id,
            description: `Payout from group (Turn ${payout.turn_position})`,
            metadata: {
              group_id: payout.group_id,
              turn_position: payout.turn_position,
              payment_method,
              transaction_reference,
            },
          })
          .select()
          .maybeSingle();

        if (walletTx) {
          walletTxId = walletTx.id;

          // Update wallet balance
          await supabase
            .from('wallets')
            .update({
              available_balance: balanceAfter,
              total_received: parseFloat(wallet.total_received) + parseFloat(payout.amount),
              payout_total: parseFloat(wallet.payout_total || 0) + parseFloat(payout.amount),
              updated_at: now.toISOString(),
            })
            .eq('id', wallet.id);
        }
      }
    }

    // Update payout
    const { data: updatedPayout, error: updateError } = await supabase
      .from('payouts')
      .update({
        status: newStatus,
        paid_at: success ? now.toISOString() : null,
        payment_method: payment_method || payout.payment_method,
        transaction_reference,
        wallet_transaction_id: walletTxId,
        failure_reason: success ? null : failure_reason,
        retry_count: success ? payout.retry_count : payout.retry_count + 1,
        notes: notes || payout.notes,
        updated_at: now.toISOString(),
      })
      .eq('id', payout_id)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    // Update schedule
    await supabase
      .from('payout_schedules')
      .update({
        status: newStatus,
        paid_at: success ? now.toISOString() : null,
        payment_method: payment_method || payout.payment_method,
        transaction_reference,
        failure_reason: success ? null : failure_reason,
        updated_at: now.toISOString(),
      })
      .eq('id', payout.schedule_id);

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: success ? 'payout_paid' : 'payout_failed',
      resource_type: 'payout',
      resource_id: payout_id,
      details: {
        schedule_id: payout.schedule_id,
        group_id: payout.group_id,
        recipient_id: payout.user_id,
        amount: payout.amount,
        payment_method,
        transaction_reference,
        failure_reason,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        payout: updatedPayout,
        message: success ? 'Payout marked as paid successfully' : 'Payout marked as failed',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error marking payout as paid:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature, x-hubtel-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const provider = new URL(req.url).searchParams.get('provider') || 'unknown';
    const signature = req.headers.get(`x-${provider}-signature`) || '';
    const payload = await req.json();

    // Log webhook event
    const { data: webhookEvent, error: webhookError } = await supabaseClient
      .from('webhook_events')
      .insert({
        provider,
        event_type: payload.event || payload.type || 'unknown',
        event_id: payload.id || payload.event_id || crypto.randomUUID(),
        payload,
        signature,
        verified: false,
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Webhook logging error:', webhookError);
    }

    // Verify signature (placeholder - implement actual verification)
    let verified = false;
    if (provider === 'paystack') {
      // Verify Paystack signature with PAYSTACK_SECRET_KEY
      verified = true; // Placeholder
    } else if (provider === 'hubtel') {
      // Verify Hubtel signature
      verified = true; // Placeholder
    }

    if (webhookEvent) {
      await supabaseClient
        .from('webhook_events')
        .update({ verified })
        .eq('id', webhookEvent.id);
    }

    if (!verified) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process webhook based on event type
    let processed = false;
    let paymentIntentId = null;
    let paymentTransactionId = null;

    if (provider === 'paystack' && payload.event === 'charge.success') {
      const reference = payload.data?.reference;
      if (reference) {
        const { data: intent } = await supabaseClient
          .from('payment_intents')
          .select('*')
          .eq('provider_reference', reference)
          .maybeSingle();

        if (intent && intent.status === 'pending') {
          paymentIntentId = intent.id;

          // Create transaction
          const { data: transaction } = await supabaseClient
            .from('payment_transactions')
            .insert({
              payment_intent_id: intent.id,
              user_id: intent.user_id,
              amount: intent.amount,
              fee: 0,
              net_amount: intent.amount,
              currency: intent.currency,
              payment_method: intent.payment_method,
              provider: intent.provider,
              provider_transaction_id: payload.data?.id,
              provider_reference: reference,
              status: 'completed',
              purpose: intent.purpose,
              metadata: intent.metadata,
              group_id: intent.group_id,
              contribution_schedule_id: intent.contribution_schedule_id,
              completed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (transaction) {
            paymentTransactionId = transaction.id;

            // Update intent
            await supabaseClient
              .from('payment_intents')
              .update({
                status: 'completed',
                provider_payment_id: payload.data?.id,
                completed_at: new Date().toISOString(),
              })
              .eq('id', intent.id);

            processed = true;
          }
        }
      }
    } else if (provider === 'hubtel' && payload.Status === 'Success') {
      const reference = payload.Data?.ClientReference;
      if (reference) {
        const { data: intent } = await supabaseClient
          .from('payment_intents')
          .select('*')
          .eq('provider_reference', reference)
          .maybeSingle();

        if (intent && intent.status === 'pending') {
          paymentIntentId = intent.id;

          const { data: transaction } = await supabaseClient
            .from('payment_transactions')
            .insert({
              payment_intent_id: intent.id,
              user_id: intent.user_id,
              amount: intent.amount,
              fee: 0,
              net_amount: intent.amount,
              currency: intent.currency,
              payment_method: intent.payment_method,
              provider: intent.provider,
              provider_transaction_id: payload.Data?.TransactionId,
              provider_reference: reference,
              status: 'completed',
              purpose: intent.purpose,
              metadata: intent.metadata,
              group_id: intent.group_id,
              contribution_schedule_id: intent.contribution_schedule_id,
              completed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (transaction) {
            paymentTransactionId = transaction.id;

            await supabaseClient
              .from('payment_intents')
              .update({
                status: 'completed',
                provider_payment_id: payload.Data?.TransactionId,
                completed_at: new Date().toISOString(),
              })
              .eq('id', intent.id);

            processed = true;
          }
        }
      }
    }

    // Update webhook event
    if (webhookEvent) {
      await supabaseClient
        .from('webhook_events')
        .update({
          processed,
          processed_at: new Date().toISOString(),
          payment_intent_id: paymentIntentId,
          payment_transaction_id: paymentTransactionId,
        })
        .eq('id', webhookEvent.id);
    }

    return new Response(JSON.stringify({ received: true, processed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
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

    const { amount, payment_method, purpose, group_id, contribution_schedule_id, metadata, idempotency_key } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!payment_method || !['momo', 'card', 'cash'].includes(payment_method)) {
      return new Response(JSON.stringify({ error: 'Invalid payment method' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!purpose || !['contribution', 'join_fee', 'wallet_topup'].includes(purpose)) {
      return new Response(JSON.stringify({ error: 'Invalid purpose' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for existing intent with same idempotency key
    if (idempotency_key) {
      const { data: existingIntent } = await supabaseClient
        .from('payment_intents')
        .select('*')
        .eq('idempotency_key', idempotency_key)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingIntent) {
        return new Response(JSON.stringify(existingIntent), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Determine provider based on payment method
    const provider = payment_method === 'momo' ? 'hubtel' : payment_method === 'card' ? 'paystack' : 'manual';

    // Create payment intent
    const intentData: any = {
      user_id: user.id,
      amount,
      currency: 'GHS',
      payment_method,
      provider,
      purpose,
      status: 'pending',
      metadata: metadata || {},
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      idempotency_key: idempotency_key || crypto.randomUUID(),
    };

    if (group_id) intentData.group_id = group_id;
    if (contribution_schedule_id) intentData.contribution_schedule_id = contribution_schedule_id;

    const { data: intent, error: intentError } = await supabaseClient
      .from('payment_intents')
      .insert(intentData)
      .select()
      .single();

    if (intentError) {
      console.error('Intent creation error:', intentError);
      return new Response(JSON.stringify({ error: 'Failed to create payment intent' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For cash/manual payments, return immediately
    if (payment_method === 'cash') {
      return new Response(JSON.stringify({
        ...intent,
        instructions: 'Please make payment at any Juli Smart Susu office. Show this reference to the cashier.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For MoMo/Card, initiate payment with provider
    let providerResponse: any = {};
    
    if (provider === 'hubtel' && payment_method === 'momo') {
      // Hubtel MoMo integration (placeholder - requires actual API keys)
      const phone = metadata?.phone || user.phone;
      providerResponse = {
        provider_reference: `HUB-${Date.now()}`,
        checkout_url: `https://checkout.hubtel.com/demo/${intent.id}`,
        instructions: `A prompt will be sent to ${phone}. Enter your MoMo PIN to complete payment.`,
      };
    } else if (provider === 'paystack' && payment_method === 'card') {
      // Paystack integration (placeholder - requires actual API keys)
      providerResponse = {
        provider_reference: `PAY-${Date.now()}`,
        checkout_url: `https://checkout.paystack.com/demo/${intent.id}`,
        instructions: 'You will be redirected to complete card payment.',
      };
    }

    // Update intent with provider details
    const { data: updatedIntent } = await supabaseClient
      .from('payment_intents')
      .update({
        provider_reference: providerResponse.provider_reference,
        checkout_url: providerResponse.checkout_url,
      })
      .eq('id', intent.id)
      .select()
      .single();

    return new Response(JSON.stringify({
      ...updatedIntent,
      instructions: providerResponse.instructions,
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
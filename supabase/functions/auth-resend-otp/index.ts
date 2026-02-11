
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+233') 
      ? phone 
      : phone.startsWith('0') 
        ? '+233' + phone.slice(1) 
        : '+233' + phone;

    // Check rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const { data: rateLimit } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', normalizedPhone)
      .eq('action', 'resend_otp')
      .maybeSingle();

    if (rateLimit && rateLimit.attempts >= 3 && 
        new Date(rateLimit.window_start).getTime() > Date.now() - 60 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: 'Too many OTP requests. Please try again in 1 hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, full_name, is_phone_verified')
      .eq('phone', normalizedPhone)
      .is('deleted_at', null)
      .maybeSingle();

    if (!user || userError) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (user.is_phone_verified) {
      return new Response(
        JSON.stringify({ error: 'Phone already verified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    await supabase
      .from('users')
      .update({
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt.toISOString(),
        otp_attempts: 0
      })
      .eq('id', user.id);

    // Update rate limit
    await supabase
      .from('rate_limits')
      .upsert({
        identifier: normalizedPhone,
        action: 'resend_otp',
        attempts: (rateLimit?.attempts || 0) + 1,
        window_start: new Date().toISOString()
      });

    // TODO: Send OTP via SMS
    console.log(`New OTP for ${normalizedPhone}: ${otpCode}`);

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'otp_resent',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent')
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        expiresIn: 600 // seconds
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resend OTP error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

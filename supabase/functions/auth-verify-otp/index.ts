
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

    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+233') 
      ? phone 
      : phone.startsWith('0') 
        ? '+233' + phone.slice(1) 
        : '+233' + phone;

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', normalizedPhone)
      .is('deleted_at', null)
      .maybeSingle();

    if (!user || userError) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already verified
    if (user.is_phone_verified) {
      return new Response(
        JSON.stringify({ success: true, message: 'Phone already verified' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check OTP attempts
    if (user.otp_attempts >= 5) {
      return new Response(
        JSON.stringify({ error: 'Too many OTP attempts. Please request a new code.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP expired
    if (!user.otp_expires_at || new Date(user.otp_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'OTP has expired. Please request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      // Increment attempts
      await supabase
        .from('users')
        .update({ otp_attempts: user.otp_attempts + 1 })
        .eq('id', user.id);

      return new Response(
        JSON.stringify({ error: 'Invalid OTP code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark phone as verified and activate account
    await supabase
      .from('users')
      .update({
        is_phone_verified: true,
        status: 'active',
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0
      })
      .eq('id', user.id);

    // Log audit
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'phone_verified',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent')
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Phone verified successfully',
        user: {
          id: user.id,
          name: user.full_name,
          phone: user.phone,
          isVerified: true
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OTP verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

    const { phone, otp, newPassword } = await req.json();

    // Step 1: Request password reset (send OTP)
    if (phone && !otp && !newPassword) {
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
        .eq('action', 'password_reset')
        .maybeSingle();

      if (rateLimit && rateLimit.attempts >= 3 && 
          new Date(rateLimit.window_start).getTime() > Date.now() - 60 * 60 * 1000) {
        return new Response(
          JSON.stringify({ error: 'Too many password reset requests. Please try again in 1 hour.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, phone, full_name')
        .eq('phone', normalizedPhone)
        .is('deleted_at', null)
        .maybeSingle();

      if (!user || userError) {
        // Don't reveal if user exists
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'If this phone number is registered, you will receive an OTP.' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Generate reset token
      const resetToken = crypto.randomUUID();

      // Update user
      await supabase
        .from('users')
        .update({
          otp_code: otpCode,
          otp_expires_at: otpExpiresAt.toISOString(),
          otp_attempts: 0,
          password_reset_token: resetToken,
          password_reset_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        })
        .eq('id', user.id);

      // Update rate limit
      await supabase
        .from('rate_limits')
        .upsert({
          identifier: normalizedPhone,
          action: 'password_reset',
          attempts: (rateLimit?.attempts || 0) + 1,
          window_start: new Date().toISOString()
        });

      // TODO: Send OTP via SMS
      console.log(`Password reset OTP for ${normalizedPhone}: ${otpCode}`);

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'password_reset_requested',
        resource_type: 'user',
        resource_id: user.id,
        ip_address: clientIp,
        user_agent: req.headers.get('user-agent')
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP sent to your phone number',
          expiresIn: 600
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Verify OTP and reset password
    if (phone && otp && newPassword) {
      // Normalize phone number
      const normalizedPhone = phone.startsWith('+233') 
        ? phone 
        : phone.startsWith('0') 
          ? '+233' + phone.slice(1) 
          : '+233' + phone;

      // Validate password
      if (newPassword.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 8 characters long' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Find user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .is('deleted_at', null)
        .maybeSingle();

      if (!user || userError) {
        return new Response(
          JSON.stringify({ error: 'Invalid request' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      // Check if reset token expired
      if (!user.password_reset_expires_at || new Date(user.password_reset_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Password reset session expired. Please start again.' }),
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

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword);

      // Update password and clear reset tokens
      await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          otp_code: null,
          otp_expires_at: null,
          otp_attempts: 0,
          password_reset_token: null,
          password_reset_expires_at: null
        })
        .eq('id', user.id);

      // Log audit
      const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'password_reset_completed',
        resource_type: 'user',
        resource_id: user.id,
        ip_address: clientIp,
        user_agent: req.headers.get('user-agent')
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


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

    const { name, phone, email, password, referralCode } = await req.json();

    // Validation
    if (!name || !phone || !password) {
      return new Response(
        JSON.stringify({ error: 'Name, phone, and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Ghana phone number format
    const phoneRegex = /^(\+233|0)[2-5][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Ghana phone number format' }),
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
      .eq('identifier', clientIp)
      .eq('action', 'register')
      .single();

    if (rateLimit && rateLimit.blocked_until && new Date(rateLimit.blocked_until) > new Date()) {
      return new Response(
        JSON.stringify({ error: 'Too many registration attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Phone number already registered' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check email if provided
    if (email) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingEmail) {
        return new Response(
          JSON.stringify({ error: 'Email already registered' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password);

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate referral code
    const userReferralCode = 'JULI' + Math.floor(100000 + Math.random() * 900000).toString();

    // Handle referral
    let referredById = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();
      
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        phone: normalizedPhone,
        email: email || null,
        password_hash: passwordHash,
        full_name: name,
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt.toISOString(),
        referral_code: userReferralCode,
        referred_by_id: referredById,
        status: 'pending_verification',
        role: 'member'
      })
      .select('id, phone, email, full_name, profile_photo_url, role, status, momo_number, is_phone_verified, notification_preferences, referral_code, created_at')
      .single();

    if (createError) {
      console.error('Create user error:', createError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create KYC profile
    await supabase.from('kyc_profiles').insert({
      user_id: newUser.id,
      status: 'not_submitted'
    });

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: newUser.id,
      action: 'user_registered',
      resource_type: 'user',
      resource_id: newUser.id,
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent')
    });

    // TODO: Send OTP via SMS (integrate SMS provider)
    console.log(`OTP for ${normalizedPhone}: ${otpCode}`);

    // Update rate limit
    await supabase
      .from('rate_limits')
      .upsert({
        identifier: clientIp,
        action: 'register',
        attempts: (rateLimit?.attempts || 0) + 1,
        window_start: new Date().toISOString()
      });

    // Generate JWT token (temporary, not verified yet)
    const token = await generateJWT(newUser.id, newUser.role);

    return new Response(
      JSON.stringify({
        user: {
          id: newUser.id,
          name: newUser.full_name,
          phone: newUser.phone,
          email: newUser.email,
          profilePhoto: newUser.profile_photo_url,
          momoNumber: newUser.momo_number || '',
          kycStatus: 'pending',
          joinedDate: newUser.created_at,
          totalSaved: 0,
          activeGroups: 0
        },
        token,
        requiresOTP: true
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateJWT(userId: string, role: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };

  const secret = Deno.env.get('JWT_SECRET') || 'your-secret-key';
  
  const encoder = new TextEncoder();
  const data = encoder.encode(
    `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}`
  );
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.${signatureBase64}`;
}


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

    const { phone, password, deviceInfo } = await req.json();

    if (!phone || !password) {
      return new Response(
        JSON.stringify({ error: 'Phone and password are required' }),
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
      .eq('action', 'login')
      .maybeSingle();

    if (rateLimit && rateLimit.attempts >= 5 && 
        new Date(rateLimit.window_start).getTime() > Date.now() - 15 * 60 * 1000) {
      // Block for 15 minutes after 5 failed attempts
      await supabase
        .from('rate_limits')
        .update({ blocked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString() })
        .eq('identifier', normalizedPhone)
        .eq('action', 'login');

      return new Response(
        JSON.stringify({ error: 'Too many login attempts. Please try again in 15 minutes.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      // Increment failed attempts
      await supabase
        .from('rate_limits')
        .upsert({
          identifier: normalizedPhone,
          action: 'login',
          attempts: (rateLimit?.attempts || 0) + 1,
          window_start: new Date().toISOString()
        });

      return new Response(
        JSON.stringify({ error: 'Invalid phone number or password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if account is suspended or banned
    if (user.status === 'suspended' || user.status === 'banned') {
      return new Response(
        JSON.stringify({ error: `Account is ${user.status}. Please contact support.` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Increment failed attempts
      await supabase
        .from('rate_limits')
        .upsert({
          identifier: normalizedPhone,
          action: 'login',
          attempts: (rateLimit?.attempts || 0) + 1,
          window_start: new Date().toISOString()
        });

      return new Response(
        JSON.stringify({ error: 'Invalid phone number or password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reset rate limit on successful login
    await supabase
      .from('rate_limits')
      .delete()
      .eq('identifier', normalizedPhone)
      .eq('action', 'login');

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Track device
    if (deviceInfo) {
      await supabase
        .from('user_devices')
        .upsert({
          user_id: user.id,
          device_id: deviceInfo.deviceId || crypto.randomUUID(),
          device_name: deviceInfo.deviceName,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip_address: clientIp,
          user_agent: req.headers.get('user-agent'),
          last_active_at: new Date().toISOString()
        });
    }

    // Get KYC status
    const { data: kyc } = await supabase
      .from('kyc_profiles')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'user_login',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent')
    });

    // Generate JWT token
    const token = await generateJWT(user.id, user.role);

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          name: user.full_name,
          phone: user.phone,
          email: user.email,
          profilePhoto: user.profile_photo_url,
          momoNumber: user.momo_number || '',
          kycStatus: kyc?.status || 'pending',
          joinedDate: user.created_at,
          totalSaved: 0, // TODO: Calculate from contributions
          activeGroups: 0 // TODO: Calculate from memberships
        },
        token
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Login error:', error);
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

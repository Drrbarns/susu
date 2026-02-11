
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

    // Get user ID from JWT (set by Supabase Edge Functions JWT verification)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = await verifyJWT(token);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, email, full_name, profile_photo_url, role, status, momo_number, is_phone_verified, is_email_verified, notification_preferences, referral_code, created_at')
      .eq('id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (!user || userError) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get KYC status
    const { data: kyc } = await supabase
      .from('kyc_profiles')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();

    // TODO: Get active groups count and total saved from memberships/contributions

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
          totalSaved: 0, // TODO: Calculate
          activeGroups: 0, // TODO: Calculate
          role: user.role,
          status: user.status,
          isPhoneVerified: user.is_phone_verified,
          isEmailVerified: user.is_email_verified,
          notificationPreferences: user.notification_preferences,
          referralCode: user.referral_code
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get current user error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function verifyJWT(token: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}

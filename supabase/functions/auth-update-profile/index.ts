
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

    // Get user ID from JWT
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

    const { profileData, kycData } = await req.json();

    // Update user profile
    if (profileData) {
      const allowedFields = ['full_name', 'email', 'profile_photo_url', 'momo_number', 'momo_provider', 'notification_preferences'];
      const updateData: any = {};

      for (const field of allowedFields) {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
        }
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Update KYC data
    if (kycData) {
      const { data: existingKyc } = await supabase
        .from('kyc_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const kycUpdateData: any = {};
      const allowedKycFields = ['id_type', 'id_number', 'id_front_url', 'id_back_url', 'selfie_url', 'address', 'city', 'region'];

      for (const field of allowedKycFields) {
        if (kycData[field] !== undefined) {
          kycUpdateData[field] = kycData[field];
        }
      }

      if (Object.keys(kycUpdateData).length > 0) {
        kycUpdateData.status = 'pending';

        if (existingKyc) {
          await supabase
            .from('kyc_profiles')
            .update(kycUpdateData)
            .eq('user_id', userId);
        } else {
          await supabase
            .from('kyc_profiles')
            .insert({
              user_id: userId,
              ...kycUpdateData
            });
        }
      }
    }

    // Get updated user data
    const { data: user } = await supabase
      .from('users')
      .select('id, phone, email, full_name, profile_photo_url, role, status, momo_number, is_phone_verified, notification_preferences, referral_code, created_at')
      .eq('id', userId)
      .single();

    const { data: kyc } = await supabase
      .from('kyc_profiles')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle();

    // Log audit
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'profile_updated',
      resource_type: 'user',
      resource_id: userId,
      details: { profileData, kycData },
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent')
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.full_name,
          phone: user.phone,
          email: user.email,
          profilePhoto: user.profile_photo_url,
          momoNumber: user.momo_number || '',
          kycStatus: kyc?.status || 'pending',
          joinedDate: user.created_at,
          totalSaved: 0,
          activeGroups: 0
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update profile error:', error);
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
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}

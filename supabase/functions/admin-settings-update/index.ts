
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check super admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Super Admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { key, value, category, description } = await req.json();

    if (!key || !value) {
      return new Response(
        JSON.stringify({ error: 'key and value required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get old value for audit
    const { data: oldSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    // Upsert setting
    const { error: upsertError } = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        category: category || 'general',
        description: description || null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (upsertError) throw upsertError;

    // Log audit trail
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'settings_updated',
      entity_type: 'settings',
      entity_id: key,
      details: {
        admin_name: userData.full_name,
        key,
        old_value: oldSetting?.value || null,
        new_value: value,
        category,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Setting updated successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Super admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { id, name, description, template_text, variables, category, is_active, send_time, timezone } = body;

    // Validate required fields
    if (!template_text || !category) {
      return new Response(JSON.stringify({ error: 'template_text and category are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract variables from template text
    const extractedVars = [...new Set(
      (template_text.match(/\{\{(\w+)\}\}/g) || []).map((v: string) => v.replace(/\{\{|\}\}/g, ''))
    )];

    const templateData = {
      name: name || `template_${Date.now()}`,
      description,
      template_text,
      variables: variables || extractedVars,
      category,
      is_active: is_active !== undefined ? is_active : true,
      send_time,
      timezone: timezone || 'Africa/Accra',
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      // Update existing template
      const { data, error } = await supabase
        .from('sms_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new template
      const { data, error } = await supabase
        .from('sms_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: id ? 'update_sms_template' : 'create_sms_template',
      resource_type: 'sms_template',
      resource_id: result.id,
      changes: templateData,
    });

    return new Response(
      JSON.stringify({ template: result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error upserting SMS template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
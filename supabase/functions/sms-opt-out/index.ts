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

    const body = await req.json();
    const { opt_out_type, reason, opt_in } = body;

    // Get user's phone number
    const { data: userData } = await supabase
      .from('users')
      .select('phone_number')
      .eq('id', user.id)
      .single();

    if (!userData?.phone_number) {
      return new Response(JSON.stringify({ error: 'User phone number not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (opt_in) {
      // Remove opt-out (opt back in)
      const { error: deleteError } = await supabase
        .from('sms_opt_outs')
        .delete()
        .eq('user_id', user.id)
        .eq('opt_out_type', opt_out_type || 'all');

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true, message: 'Successfully opted back in to SMS notifications' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Opt out
      const { data: optOut, error: optOutError } = await supabase
        .from('sms_opt_outs')
        .upsert({
          user_id: user.id,
          phone_number: userData.phone_number,
          opt_out_type: opt_out_type || 'all',
          reason,
          opted_out_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,opt_out_type',
        })
        .select()
        .single();

      if (optOutError) throw optOutError;

      return new Response(
        JSON.stringify({ success: true, opt_out: optOut }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error managing SMS opt-out:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
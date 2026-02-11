
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
      .maybeSingle();

    if (!userData || !['super_admin', 'admin'].includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { payout_id, approved, notes } = body;

    if (!payout_id || approved === undefined) {
      return new Response(
        JSON.stringify({ error: 'payout_id and approved are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the payout
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payout_id)
      .maybeSingle();

    if (payoutError || !payout) {
      return new Response(
        JSON.stringify({ error: 'Payout not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (payout.status !== 'initiated') {
      return new Response(
        JSON.stringify({ error: `Payout already ${payout.status}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = new Date();
    const newStatus = approved ? 'approved' : 'cancelled';

    // Update payout
    const { data: updatedPayout, error: updateError } = await supabase
      .from('payouts')
      .update({
        status: newStatus,
        approved_at: approved ? now.toISOString() : null,
        approved_by: user.id,
        notes: notes || payout.notes,
        updated_at: now.toISOString(),
      })
      .eq('id', payout_id)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    // Update schedule
    await supabase
      .from('payout_schedules')
      .update({
        status: newStatus,
        approved_at: approved ? now.toISOString() : null,
        approved_by: user.id,
        updated_at: now.toISOString(),
      })
      .eq('id', payout.schedule_id);

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: approved ? 'payout_approved' : 'payout_cancelled',
      resource_type: 'payout',
      resource_id: payout_id,
      details: {
        schedule_id: payout.schedule_id,
        group_id: payout.group_id,
        recipient_id: payout.user_id,
        amount: payout.amount,
        notes,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        payout: updatedPayout,
        message: approved ? 'Payout approved successfully' : 'Payout cancelled',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error approving payout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

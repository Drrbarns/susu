
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

    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (!userData || !['super_admin', 'admin', 'support'].includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { ticket_id, status, priority, assigned_to, resolution_notes, message, is_internal } = await req.json();

    if (!ticket_id) {
      return new Response(
        JSON.stringify({ error: 'ticket_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updates: any = { updated_at: new Date().toISOString() };

    if (status) {
      updates.status = status;
      if (status === 'resolved' || status === 'closed') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user.id;
      }
    }
    if (priority) updates.priority = priority;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (resolution_notes) updates.resolution_notes = resolution_notes;

    // Update ticket
    const { error: updateError } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticket_id);

    if (updateError) throw updateError;

    // Add message if provided
    if (message) {
      await supabase.from('ticket_messages').insert({
        ticket_id,
        user_id: user.id,
        message,
        is_internal: is_internal || false,
      });
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'ticket_updated',
      entity_type: 'support_ticket',
      entity_id: ticket_id,
      details: {
        admin_name: userData.full_name,
        updates,
        message_added: !!message,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ticket updated successfully',
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

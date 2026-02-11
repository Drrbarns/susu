import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SMS Provider: Hubtel (Ghana)
async function sendViaHubtel(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = Deno.env.get('HUBTEL_API_KEY');
  const apiSecret = Deno.env.get('HUBTEL_API_SECRET');
  const senderId = Deno.env.get('HUBTEL_SENDER_ID') || 'JULI SUSU';

  if (!apiKey || !apiSecret) {
    return { success: false, error: 'Hubtel credentials not configured' };
  }

  try {
    const auth = btoa(`${apiKey}:${apiSecret}`);
    const response = await fetch('https://devapi.hubtel.com/v2/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        From: senderId,
        To: phoneNumber,
        Content: message,
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.MessageId) {
      return { success: true, messageId: result.MessageId };
    } else {
      return { success: false, error: result.Message || 'Failed to send SMS' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// SMS Provider: Arkesel (Ghana alternative)
async function sendViaArkesel(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = Deno.env.get('ARKESEL_API_KEY');
  const senderId = Deno.env.get('ARKESEL_SENDER_ID') || 'JULI SUSU';

  if (!apiKey) {
    return { success: false, error: 'Arkesel credentials not configured' };
  }

  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: senderId,
        recipients: [phoneNumber],
        message: message,
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.code === '200') {
      return { success: true, messageId: result.data?.message_id };
    } else {
      return { success: false, error: result.message || 'Failed to send SMS' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Variable substitution
function substituteVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return result;
}

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
    const { user_id, phone_number, template_id, variables, message_text, metadata, scheduled_for } = body;

    if (!phone_number) {
      return new Response(JSON.stringify({ error: 'phone_number is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check opt-out status
    const { data: optOut } = await supabase
      .from('sms_opt_outs')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('opt_out_type', 'all')
      .maybeSingle();

    if (optOut) {
      // Log but don't send
      await supabase.from('sms_logs').insert({
        user_id,
        phone_number,
        template_id,
        message_text: message_text || 'User opted out',
        provider: 'manual',
        status: 'opted_out',
        metadata,
      });

      return new Response(
        JSON.stringify({ success: false, message: 'User has opted out of SMS' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get template if template_id provided
    let finalMessage = message_text;
    if (template_id && !message_text) {
      const { data: template } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('id', template_id)
        .single();

      if (template) {
        finalMessage = substituteVariables(template.template_text, variables || {});
      }
    }

    if (!finalMessage) {
      return new Response(JSON.stringify({ error: 'message_text or template_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If scheduled, create log and return
    if (scheduled_for) {
      const { data: log } = await supabase
        .from('sms_logs')
        .insert({
          user_id,
          phone_number,
          template_id,
          message_text: finalMessage,
          provider: 'hubtel',
          status: 'pending',
          scheduled_for,
          metadata,
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ success: true, scheduled: true, log_id: log.id }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send immediately
    const provider = Deno.env.get('SMS_PROVIDER') || 'hubtel';
    let sendResult;

    if (provider === 'arkesel') {
      sendResult = await sendViaArkesel(phone_number, finalMessage);
    } else {
      sendResult = await sendViaHubtel(phone_number, finalMessage);
    }

    // Log the SMS
    const { data: log } = await supabase
      .from('sms_logs')
      .insert({
        user_id,
        phone_number,
        template_id,
        message_text: finalMessage,
        provider,
        provider_message_id: sendResult.messageId,
        status: sendResult.success ? 'sent' : 'failed',
        error_message: sendResult.error,
        sent_at: sendResult.success ? new Date().toISOString() : null,
        metadata,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ 
        success: sendResult.success, 
        log_id: log.id,
        message_id: sendResult.messageId,
        error: sendResult.error 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
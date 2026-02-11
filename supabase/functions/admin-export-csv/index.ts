
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.map(escapeCSV).join(',');
  const rows = data.map(row => 
    headers.map(header => escapeCSV(row[header])).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

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
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['super_admin', 'admin'].includes(userData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // members, contributions, payouts, transactions
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let data: any[] = [];
    let headers: string[] = [];
    let filename = 'export.csv';

    switch (type) {
      case 'members': {
        const { data: members } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            phone,
            email,
            status,
            created_at,
            kyc_profiles (verification_status),
            wallets (balance)
          `)
          .eq('role', 'member')
          .order('created_at', { ascending: false });

        data = members?.map(m => ({
          id: m.id,
          name: m.full_name,
          phone: m.phone,
          email: m.email || '',
          status: m.status,
          kyc_status: m.kyc_profiles?.[0]?.verification_status || 'not_submitted',
          wallet_balance: m.wallets?.[0]?.balance || '0',
          joined_date: new Date(m.created_at).toLocaleDateString(),
        })) || [];

        headers = ['id', 'name', 'phone', 'email', 'status', 'kyc_status', 'wallet_balance', 'joined_date'];
        filename = 'members_export.csv';
        break;
      }

      case 'contributions': {
        let query = supabase
          .from('contributions')
          .select(`
            id,
            amount,
            status,
            payment_date,
            created_at,
            users!contributions_user_id_fkey (full_name, phone),
            groups (name)
          `)
          .order('created_at', { ascending: false });

        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);

        const { data: contributions } = await query;

        data = contributions?.map(c => ({
          id: c.id,
          member_name: c.users?.full_name || '',
          member_phone: c.users?.phone || '',
          group_name: c.groups?.name || '',
          amount: c.amount,
          status: c.status,
          payment_date: c.payment_date ? new Date(c.payment_date).toLocaleDateString() : '',
          created_date: new Date(c.created_at).toLocaleDateString(),
        })) || [];

        headers = ['id', 'member_name', 'member_phone', 'group_name', 'amount', 'status', 'payment_date', 'created_date'];
        filename = 'contributions_export.csv';
        break;
      }

      case 'payouts': {
        let query = supabase
          .from('payouts')
          .select(`
            id,
            amount,
            status,
            payout_date,
            created_at,
            users!payouts_user_id_fkey (full_name, phone),
            groups (name)
          `)
          .order('created_at', { ascending: false });

        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);

        const { data: payouts } = await query;

        data = payouts?.map(p => ({
          id: p.id,
          member_name: p.users?.full_name || '',
          member_phone: p.users?.phone || '',
          group_name: p.groups?.name || '',
          amount: p.amount,
          status: p.status,
          payout_date: p.payout_date ? new Date(p.payout_date).toLocaleDateString() : '',
          created_date: new Date(p.created_at).toLocaleDateString(),
        })) || [];

        headers = ['id', 'member_name', 'member_phone', 'group_name', 'amount', 'status', 'payout_date', 'created_date'];
        filename = 'payouts_export.csv';
        break;
      }

      case 'transactions': {
        let query = supabase
          .from('payment_transactions')
          .select(`
            id,
            amount,
            status,
            payment_method,
            provider,
            created_at,
            users (full_name, phone)
          `)
          .order('created_at', { ascending: false });

        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);

        const { data: transactions } = await query;

        data = transactions?.map(t => ({
          id: t.id,
          member_name: t.users?.full_name || '',
          member_phone: t.users?.phone || '',
          amount: t.amount,
          payment_method: t.payment_method,
          provider: t.provider,
          status: t.status,
          date: new Date(t.created_at).toLocaleDateString(),
        })) || [];

        headers = ['id', 'member_name', 'member_phone', 'amount', 'payment_method', 'provider', 'status', 'date'];
        filename = 'transactions_export.csv';
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid export type. Use: members, contributions, payouts, or transactions' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const csv = arrayToCSV(data, headers);

    // Log audit trail
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'data_exported',
      entity_type: 'export',
      entity_id: type,
      details: {
        export_type: type,
        record_count: data.length,
        start_date: startDate,
        end_date: endDate,
      },
    });

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

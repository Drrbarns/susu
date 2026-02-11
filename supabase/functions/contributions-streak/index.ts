
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

    const url = new URL(req.url);
    const groupId = url.searchParams.get('group_id');

    // Get all paid contributions ordered by due date descending
    let query = supabase
      .from('contribution_schedules')
      .select('due_date, status, paid_at')
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .order('due_date', { ascending: false });

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: contributions, error: contributionsError } = await query;

    if (contributionsError) throw contributionsError;

    if (!contributions || contributions.length === 0) {
      return new Response(
        JSON.stringify({
          current_streak: 0,
          longest_streak: 0,
          total_contributions: 0,
          last_contribution_date: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let expectedDate = new Date(today);
    
    for (const contribution of contributions) {
      const contribDate = new Date(contribution.due_date);
      contribDate.setHours(0, 0, 0, 0);
      
      // For current streak calculation
      if (currentStreak === 0 || contribDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (currentStreak > 0) {
        // Streak broken
        break;
      }
    }

    // Calculate longest streak
    let prevDate: Date | null = null;
    for (const contribution of contributions) {
      const contribDate = new Date(contribution.due_date);
      contribDate.setHours(0, 0, 0, 0);
      
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const dayDiff = Math.floor((prevDate.getTime() - contribDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      
      prevDate = contribDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const lastContribution = contributions[0];

    return new Response(
      JSON.stringify({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_contributions: contributions.length,
        last_contribution_date: lastContribution.paid_at,
        group_id: groupId || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error calculating streak:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { POINTS } from '../lib/constants';
import type { Activity, ActivityType, RevenueEntry } from '../types';

interface KpiTotals {
  sendout: number;
  client_meeting: number;
  candidate_call: number;
  points: number;
}

export interface DashboardData {
  today: KpiTotals;
  month: KpiTotals;
  monthRevenue: number;
  yearRevenue: number;
  dailyRank: number | null;
  monthlyRank: number | null;
  recent: Activity[];
  recentRevenue: RevenueEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function emptyTotals(): KpiTotals {
  return { sendout: 0, client_meeting: 0, candidate_call: 0, points: 0 };
}

function tallyActivities(rows: { type: ActivityType }[]): KpiTotals {
  const t = emptyTotals();
  for (const r of rows) {
    t[r.type] += 1;
  }
  t.points =
    t.sendout * POINTS.sendout +
    t.client_meeting * POINTS.client_meeting +
    t.candidate_call * POINTS.candidate_call;
  return t;
}

// ISO date helpers in local time
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function useDashboard(userId: string | undefined): DashboardData {
  const [data, setData] = useState<Omit<DashboardData, 'refetch'>>({
    today: emptyTotals(),
    month: emptyTotals(),
    monthRevenue: 0,
    yearRevenue: 0,
    dailyRank: null,
    monthlyRank: null,
    recent: [],
    recentRevenue: [],
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setData((d) => ({ ...d, loading: true, error: null }));

    const now = new Date();
    const todayStr = isoDate(now);
    const monthStart = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const yearStart = isoDate(new Date(now.getFullYear(), 0, 1));

    try {
      // This month's activities for this user (covers today too)
      const { data: acts, error: actErr } = await supabase
        .from('activities')
        .select('id, user_id, type, activity_date, source, bullhorn_id, notes, created_at, updated_at')
        .eq('user_id', userId)
        .gte('activity_date', monthStart)
        .order('created_at', { ascending: false });
      if (actErr) throw actErr;

      const monthActs = acts ?? [];
      const todayActs = monthActs.filter((a) => a.activity_date === todayStr);

      // This year's revenue for this user (covers month too)
      const { data: revs, error: revErr } = await supabase
        .from('revenue_entries')
        .select('id, user_id, amount, invoice_date, description, created_at, updated_at')
        .eq('user_id', userId)
        .gte('invoice_date', yearStart)
        .order('created_at', { ascending: false });
      if (revErr) throw revErr;

      const yearRevs = revs ?? [];
      const monthRevs = yearRevs.filter((r) => r.invoice_date >= monthStart);
      const monthRevenue = monthRevs.reduce((s, r) => s + Number(r.amount), 0);
      const yearRevenue = yearRevs.reduce((s, r) => s + Number(r.amount), 0);

      // Ranks come from the leaderboard read functions (public, aggregated)
      const [{ data: dailyLb }, { data: monthlyLb }] = await Promise.all([
        supabase.rpc('get_daily_leaderboard'),
        supabase.rpc('get_monthly_kpi_leaderboard'),
      ]);

      const dailyRank =
        (dailyLb as { id: string }[] | null)?.findIndex((r) => r.id === userId) ?? -1;
      const monthlyRank =
        (monthlyLb as { id: string }[] | null)?.findIndex((r) => r.id === userId) ?? -1;

      setData({
        today: tallyActivities(todayActs as { type: ActivityType }[]),
        month: tallyActivities(monthActs as { type: ActivityType }[]),
        monthRevenue,
        yearRevenue,
        dailyRank: dailyRank >= 0 ? dailyRank + 1 : null,
        monthlyRank: monthlyRank >= 0 ? monthlyRank + 1 : null,
        recent: (monthActs as Activity[]).slice(0, 20),
        recentRevenue: yearRevs as RevenueEntry[],
        loading: false,
        error: null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load your dashboard.';
      setData((d) => ({ ...d, loading: false, error: msg }));
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, refetch: fetchAll };
}

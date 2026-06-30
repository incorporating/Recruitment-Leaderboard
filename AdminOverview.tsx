import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { KpiLeaderboardRow, RevenueLeaderboardRow } from '../types';

export interface LeaderboardData {
  daily: KpiLeaderboardRow[];
  monthlyKpi: KpiLeaderboardRow[];
  monthlyRevenue: RevenueLeaderboardRow[];
  yearlyRevenue: RevenueLeaderboardRow[];
  loading: boolean;
  error: string | null;
}

// Fetches all four leaderboards through the public SECURITY DEFINER functions
// (so the anonymous TV display can read them) and re-fetches on any realtime
// change to activities or revenue_entries.
export function useLeaderboard(): LeaderboardData {
  const [data, setData] = useState<LeaderboardData>({
    daily: [],
    monthlyKpi: [],
    monthlyRevenue: [],
    yearlyRevenue: [],
    loading: true,
    error: null,
  });

  // Guard against overlapping refetches stamping stale results.
  const fetchSeq = useRef(0);

  const fetchAll = useCallback(async () => {
    const seq = ++fetchSeq.current;
    try {
      const [daily, monthlyKpi, monthlyRevenue, yearlyRevenue] = await Promise.all([
        supabase.rpc('get_daily_leaderboard'),
        supabase.rpc('get_monthly_kpi_leaderboard'),
        supabase.rpc('get_monthly_revenue_leaderboard'),
        supabase.rpc('get_yearly_revenue_leaderboard'),
      ]);

      if (seq !== fetchSeq.current) return; // a newer fetch superseded this one

      const firstError =
        daily.error || monthlyKpi.error || monthlyRevenue.error || yearlyRevenue.error;
      if (firstError) throw firstError;

      setData({
        daily: (daily.data ?? []) as KpiLeaderboardRow[],
        monthlyKpi: (monthlyKpi.data ?? []) as KpiLeaderboardRow[],
        monthlyRevenue: (monthlyRevenue.data ?? []) as RevenueLeaderboardRow[],
        yearlyRevenue: (yearlyRevenue.data ?? []) as RevenueLeaderboardRow[],
        loading: false,
        error: null,
      });
    } catch (e) {
      if (seq !== fetchSeq.current) return;
      const msg = e instanceof Error ? e.message : 'Failed to load leaderboards.';
      setData((d) => ({ ...d, loading: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    fetchAll();

    // Realtime: any change to activities or revenue triggers a refetch.
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        fetchAll
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'revenue_entries' },
        fetchAll
      )
      .subscribe();

    // Safety net: also refetch every 60s in case a realtime event is missed
    // (e.g. transient socket drop on a long-running kiosk).
    const interval = setInterval(fetchAll, 60_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchAll]);

  return data;
}

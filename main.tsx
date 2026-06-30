import { ScreenShell } from './ScreenShell';
import { KpiTable, RevenueTable } from './LeaderboardTable';
import type { LeaderboardData } from '../../hooks/useLeaderboard';

function monthLabel(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
function fullDateLabel(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
function yearLabel(): string {
  return String(new Date().getFullYear());
}

export function ScreenDailyKPI({ data }: { data: LeaderboardData }) {
  return (
    <ScreenShell title="TODAY'S PERFORMANCE" subtitle={fullDateLabel()}>
      <KpiTable rows={data.daily} />
    </ScreenShell>
  );
}

export function ScreenMonthlyKPI({ data }: { data: LeaderboardData }) {
  return (
    <ScreenShell title="THIS MONTH'S PERFORMANCE" subtitle={monthLabel()}>
      <KpiTable rows={data.monthlyKpi} />
    </ScreenShell>
  );
}

export function ScreenMonthlyRevenue({ data }: { data: LeaderboardData }) {
  return (
    <ScreenShell title="MONTHLY REVENUE" subtitle={monthLabel()}>
      <RevenueTable rows={data.monthlyRevenue} />
    </ScreenShell>
  );
}

export function ScreenYearlyRevenue({ data }: { data: LeaderboardData }) {
  return (
    <ScreenShell title="YEAR TO DATE REVENUE" subtitle={yearLabel()}>
      <RevenueTable rows={data.yearlyRevenue} />
    </ScreenShell>
  );
}

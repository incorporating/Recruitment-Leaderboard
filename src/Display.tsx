import { useLeaderboard } from '../hooks/useLeaderboard';
import { GBP } from '../lib/constants';
import { Card, Spinner } from '../components/ui';
import type { KpiLeaderboardRow, RevenueLeaderboardRow } from '../types';

function KpiList({ rows }: { rows: KpiLeaderboardRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-slate-500">No data yet.</p>;
  return (
    <ol className="space-y-1.5">
      {rows.slice(0, 8).map((r, i) => (
        <li key={r.id} className="flex items-center justify-between text-sm">
          <span className="text-slate-300">
            <span className="tnum mr-2 text-slate-500">{i + 1}</span>
            {r.full_name}
          </span>
          <span className="tnum font-semibold text-white">{r.total_points.toLocaleString()}</span>
        </li>
      ))}
    </ol>
  );
}

function RevenueList({ rows }: { rows: RevenueLeaderboardRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-slate-500">No data yet.</p>;
  return (
    <ol className="space-y-1.5">
      {rows.slice(0, 8).map((r, i) => (
        <li key={r.id} className="flex items-center justify-between text-sm">
          <span className="text-slate-300">
            <span className="tnum mr-2 text-slate-500">{i + 1}</span>
            {r.full_name}
          </span>
          <span className="tnum font-semibold text-white">{GBP.format(Number(r.total_revenue))}</span>
        </li>
      ))}
    </ol>
  );
}

export default function AdminOverview() {
  const data = useLeaderboard();

  if (data.loading) return <Spinner />;

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-white">Overview</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-light">
            Today's points
          </h3>
          <KpiList rows={data.daily} />
        </Card>
        <Card>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-light">
            This month's points
          </h3>
          <KpiList rows={data.monthlyKpi} />
        </Card>
        <Card>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-light">
            Monthly revenue
          </h3>
          <RevenueList rows={data.monthlyRevenue} />
        </Card>
        <Card>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-light">
            Yearly revenue
          </h3>
          <RevenueList rows={data.yearlyRevenue} />
        </Card>
      </div>
    </div>
  );
}

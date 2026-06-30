import { Card } from '../ui';
import { GBP } from '../../lib/constants';
import type { DashboardData } from '../../hooks/useDashboard';

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="tnum font-semibold text-white">{value}</span>
    </div>
  );
}

function rankLabel(rank: number | null): string {
  if (rank == null) return 'Unranked';
  return `#${rank}`;
}

export function StatsCards({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-light">
          Today
        </h3>
        <StatRow label="Sendouts" value={data.today.sendout} />
        <StatRow label="Meetings" value={data.today.client_meeting} />
        <StatRow label="Calls" value={data.today.candidate_call} />
        <div className="my-2 border-t border-navy-700" />
        <StatRow label="Points" value={data.today.points.toLocaleString()} />
        <div className="mt-2 text-sm text-slate-400">
          Rank <span className="font-semibold text-white">{rankLabel(data.dailyRank)}</span> today
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-light">
          This Month
        </h3>
        <StatRow label="Sendouts" value={data.month.sendout} />
        <StatRow label="Meetings" value={data.month.client_meeting} />
        <StatRow label="Calls" value={data.month.candidate_call} />
        <div className="my-2 border-t border-navy-700" />
        <StatRow label="Points" value={data.month.points.toLocaleString()} />
        <div className="mt-2 text-sm text-slate-400">
          Rank <span className="font-semibold text-white">{rankLabel(data.monthlyRank)}</span> this month
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-light">
          Revenue
        </h3>
        <StatRow label="This month" value={GBP.format(data.monthRevenue)} />
        <StatRow label="This year" value={GBP.format(data.yearRevenue)} />
      </Card>
    </div>
  );
}

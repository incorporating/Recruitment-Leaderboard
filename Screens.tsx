import { ACTIVITY_META } from '../../lib/constants';
import { Card } from '../ui';
import type { Activity } from '../../types';

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

// Read-only recent activity for the consultant stats view.
// Activities are sourced from Bullhorn (or added by an admin), so consultants
// view but do not edit them here. Manual add/edit/delete lives in the admin panel.
export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <h3 className="mb-3 font-display text-lg font-semibold text-white">Recent activity</h3>
      {activities.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No activity yet. Your sendouts, meetings and calls will appear here as they sync.
        </p>
      ) : (
        <ul className="divide-y divide-navy-700">
          {activities.map((a) => {
            const meta = ACTIVITY_META[a.type];
            const isBullhorn = a.source === 'bullhorn';
            return (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xl" aria-hidden>
                  {meta.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{meta.label}</span>
                    {isBullhorn && (
                      <span
                        title="Synced from Bullhorn"
                        className="rounded bg-navy-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400"
                      >
                        Bullhorn
                      </span>
                    )}
                  </div>
                  {a.notes && <p className="truncate text-sm text-slate-400">{a.notes}</p>}
                </div>
                <span className="tnum shrink-0 text-sm text-slate-500">
                  {formatDate(a.activity_date)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

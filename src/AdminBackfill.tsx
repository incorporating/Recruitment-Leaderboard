import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { Header } from '../components/Header';
import { Spinner } from '../components/ui';
import { StatsCards } from '../components/dashboard/StatsCards';
import { RecentActivity } from '../components/dashboard/RecentActivity';

function today(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Consultant dashboard: a performance / "how am I doing" view.
// Activities and revenue are sourced from Bullhorn; manual entry and editing
// live in the admin panel. Consultants log in here purely to see their stats.
export default function Dashboard() {
  const { profile } = useAuth();
  const data = useDashboard(profile?.id);

  if (!profile) return null;

  const firstName = profile.full_name.split(' ')[0];

  return (
    <div className="min-h-full">
      <Header
        right={
          <Link
            to="/dashboard/history"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-navy-700 hover:text-white sm:inline"
          >
            History
          </Link>
        }
      />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Welcome banner with rank summary */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Good to see you, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{today()}</p>
          {!data.loading && !data.error && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-navy-700 px-3 py-1 text-slate-300">
                Daily rank{' '}
                <span className="font-semibold text-white">
                  {data.dailyRank ? `#${data.dailyRank}` : '-'}
                </span>
              </span>
              <span className="rounded-full bg-navy-700 px-3 py-1 text-slate-300">
                Monthly rank{' '}
                <span className="font-semibold text-white">
                  {data.monthlyRank ? `#${data.monthlyRank}` : '-'}
                </span>
              </span>
            </div>
          )}
        </div>

        {data.loading ? (
          <Spinner />
        ) : data.error ? (
          <div className="rounded-xl border border-red-600/40 bg-red-600/10 p-4 text-sm text-red-300">
            {data.error}
          </div>
        ) : (
          <div className="space-y-6">
            <StatsCards data={data} />
            <RecentActivity activities={data.recent} />
          </div>
        )}
      </main>
    </div>
  );
}

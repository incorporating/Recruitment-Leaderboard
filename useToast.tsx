import { motion } from 'framer-motion';
import { MedalIcon } from './MedalIcon';
import { AnimatedNumber } from './AnimatedNumber';
import { GBP } from '../../lib/constants';
import type { KpiLeaderboardRow, RevenueLeaderboardRow } from '../../types';

// Shown only when there are no consultants at all (e.g. before any are added).
function WaitingForData() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-4xl font-semibold text-slate-500">
        Waiting for data
      </p>
      <p className="mt-3 text-xl text-slate-600">
        Results will appear here as they come through.
      </p>
    </div>
  );
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

// Styling for a row based on its rank. Rank 1 gets a strong gold treatment;
// 2 and 3 get a subtle highlight; the rest are plain.
function rowClasses(rank: number): string {
  if (rank === 1) {
    return 'bg-gold/10 ring-1 ring-gold/40';
  }
  if (rank <= 3) {
    return 'bg-white/[0.03]';
  }
  return '';
}

// First place gets larger text; others standard.
function nameSize(rank: number): string {
  return rank === 1 ? 'text-5xl' : 'text-4xl';
}
function valueSize(rank: number): string {
  return rank === 1 ? 'text-5xl' : 'text-4xl';
}

export function KpiTable({ rows }: { rows: KpiLeaderboardRow[] }) {
  if (rows.length === 0) return <WaitingForData />;

  return (
    <div className="flex-1 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-xl uppercase tracking-wider text-brand-light">
            <th className="w-20 pb-4 pl-4 font-semibold">#</th>
            <th className="pb-4 font-semibold">Consultant</th>
            <th className="pb-4 text-center font-semibold">Sendouts</th>
            <th className="pb-4 text-center font-semibold">Meetings</th>
            <th className="pb-4 text-center font-semibold">Calls</th>
            <th className="pb-4 pr-4 text-right font-semibold">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const rank = i + 1;
            const dim = r.total_points === 0 ? 'opacity-50' : '';
            return (
              <motion.tr
                key={r.id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className={`border-t border-navy-700/60 ${rowClasses(rank)} ${dim}`}
              >
                <td className="py-3 pl-4 text-3xl">
                  <MedalIcon rank={rank} />
                </td>
                <td className={`py-3 font-semibold text-white ${nameSize(rank)}`}>
                  {r.full_name}
                </td>
                <td className="tnum py-3 text-center text-3xl text-slate-200">{r.sendouts}</td>
                <td className="tnum py-3 text-center text-3xl text-slate-200">
                  {r.client_meetings}
                </td>
                <td className="tnum py-3 text-center text-3xl text-slate-200">
                  {r.candidate_calls}
                </td>
                <td
                  className={`tnum py-3 pr-4 text-right font-bold ${valueSize(rank)} ${
                    rank === 1 ? 'text-gold' : 'text-brand-light'
                  }`}
                >
                  <AnimatedNumber value={r.total_points} />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function RevenueTable({ rows }: { rows: RevenueLeaderboardRow[] }) {
  if (rows.length === 0) return <WaitingForData />;

  return (
    <div className="flex-1 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-xl uppercase tracking-wider text-brand-light">
            <th className="w-20 pb-4 pl-4 font-semibold">#</th>
            <th className="pb-4 font-semibold">Consultant</th>
            <th className="pb-4 pr-4 text-right font-semibold">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const rank = i + 1;
            const dim = Number(r.total_revenue) === 0 ? 'opacity-50' : '';
            return (
              <motion.tr
                key={r.id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className={`border-t border-navy-700/60 ${rowClasses(rank)} ${dim}`}
              >
                <td className="py-3 pl-4 text-3xl">
                  <MedalIcon rank={rank} />
                </td>
                <td className={`py-3 font-semibold text-white ${nameSize(rank)}`}>
                  {r.full_name}
                </td>
                <td
                  className={`tnum py-3 pr-4 text-right font-bold ${valueSize(rank)} ${
                    rank === 1 ? 'text-gold' : 'text-brand-light'
                  }`}
                >
                  <AnimatedNumber
                    value={Number(r.total_revenue)}
                    format={(n) => GBP.format(n)}
                  />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

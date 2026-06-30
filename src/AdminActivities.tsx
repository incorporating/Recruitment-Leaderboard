import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { SCREEN_DURATION_MS } from '../lib/constants';
import { ProgressBar } from '../components/leaderboard/ProgressBar';
import {
  ScreenDailyKPI,
  ScreenMonthlyKPI,
  ScreenMonthlyRevenue,
  ScreenYearlyRevenue,
} from '../components/leaderboard/Screens';
import { Spinner } from '../components/ui';

const SCREENS = [
  ScreenDailyKPI,
  ScreenMonthlyKPI,
  ScreenMonthlyRevenue,
  ScreenYearlyRevenue,
];

// The public TV leaderboard. Rotates through four screens on a fixed cycle,
// with slide+fade transitions. Data updates live via realtime underneath the
// rotation, so a screen can change mid-cycle when new results arrive.
export default function Display() {
  const data = useLeaderboard();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SCREENS.length);
    }, SCREEN_DURATION_MS);
    return () => clearInterval(t);
  }, []);

  if (data.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy-900">
        <Spinner />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-navy-900 text-center">
        <p className="font-display text-3xl text-slate-300">Unable to load the leaderboard</p>
        <p className="mt-2 text-lg text-slate-500">Retrying automatically…</p>
      </div>
    );
  }

  const Screen = SCREENS[index];

  return (
    <div className="relative h-screen overflow-hidden bg-navy-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="h-full"
        >
          <Screen data={data} />
        </motion.div>
      </AnimatePresence>

      <ProgressBar cycleKey={index} durationMs={SCREEN_DURATION_MS} />
    </div>
  );
}

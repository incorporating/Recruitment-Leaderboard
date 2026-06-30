import { motion } from 'framer-motion';

// A thin bar pinned to the bottom that fills over `durationMs`, keyed so it
// restarts its animation on each screen change.
export function ProgressBar({
  cycleKey,
  durationMs,
}: {
  cycleKey: number;
  durationMs: number;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-1.5 bg-navy-700">
      <motion.div
        key={cycleKey}
        className="h-full bg-brand-blue"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: durationMs / 1000, ease: 'linear' }}
      />
    </div>
  );
}

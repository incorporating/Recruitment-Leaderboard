// Rank indicator: gold/silver/bronze medals for top 3, plain number otherwise.
const MEDALS = ['🥇', '🥈', '🥉'];

export function MedalIcon({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="text-[1.4em] leading-none" aria-label={`Rank ${rank}`}>
        {MEDALS[rank - 1]}
      </span>
    );
  }
  return (
    <span className="tnum text-slate-400" aria-label={`Rank ${rank}`}>
      {rank}
    </span>
  );
}

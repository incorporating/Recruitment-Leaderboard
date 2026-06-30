import { useEffect, useState, type ReactNode } from 'react';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// Common chrome for every display screen: logo top-left, title centre,
// live date/time top-right, and a content area for the leaderboard.
export function ScreenShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const now = useClock();
  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="flex h-screen flex-col px-10 py-8">
      {/* Top bar */}
      <div className="flex items-start justify-between">
        <img src="/logo-mark.svg" alt="Newman Stewart" className="h-20 w-auto" />
        <div className="text-center">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-1 text-2xl text-brand-light">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="tnum text-4xl font-semibold text-white">{time}</p>
          <p className="text-xl text-slate-400">{date}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

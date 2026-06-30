import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui';

// Temporary placeholder used for routes whose full UI lands in later phases.
// Keeps routing/auth fully testable in Phase 1.
export default function Placeholder({ title, phase }: { title: string; phase: string }) {
  const { profile, signOut } = useAuth();
  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="rounded-full bg-navy-700 px-3 py-1 text-xs uppercase tracking-wider text-slate-400">
        {phase}
      </span>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      {profile && (
        <p className="text-slate-400">
          Signed in as {profile.full_name} ({profile.role})
        </p>
      )}
      <p className="max-w-md text-sm text-slate-500">
        This screen is scaffolded and will be built in a later phase. Routing and
        authentication are working.
      </p>
      {profile && (
        <Button variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      )}
    </div>
  );
}

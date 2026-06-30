import { useAuth } from '../hooks/useAuth';

export function Header({ right }: { right?: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  return (
    <header className="flex items-center justify-between border-b border-navy-700 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <img src="/logo-mark.svg" alt="Newman Stewart" className="h-10 w-auto" />
      </div>
      <div className="flex items-center gap-4">
        {right}
        {profile && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:inline">
              {profile.full_name}
            </span>
            <button
              onClick={signOut}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-navy-700 hover:text-white"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

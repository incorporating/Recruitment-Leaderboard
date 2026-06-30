import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './ui';
import type { Role } from '../types';

// Guards a route: requires a session, and optionally a specific role.
export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: Role;
}) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  // Profile may still be resolving on first paint after login.
  if (!profile) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (requireRole && profile.role !== requireRole) {
    // Wrong role — send them to their own home.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

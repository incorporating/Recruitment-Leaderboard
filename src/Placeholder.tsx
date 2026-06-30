import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui';

// "/" — decide where to send the visitor.
//   not logged in   -> /display (public TV view)
//   consultant      -> /dashboard
//   admin           -> /admin
export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) return <Navigate to="/display" replace />;
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

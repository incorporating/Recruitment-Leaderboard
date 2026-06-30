import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';

import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Display from './pages/Display';
import Placeholder from './pages/Placeholder';

import AdminOverview from './pages/AdminOverview';
import AdminUsers from './pages/AdminUsers';
import AdminActivities from './pages/AdminActivities';
import AdminRevenue from './pages/AdminRevenue';
import AdminBackfill from './pages/AdminBackfill';
import AdminBullhorn from './pages/AdminBullhorn';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Public TV display */}
            <Route path="/display" element={<Display />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Consultant */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireRole="consultant">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/history"
              element={
                <ProtectedRoute requireRole="consultant">
                  <Placeholder title="Activity History" phase="Phase 2" />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="activities" element={<AdminActivities />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="backfill" element={<AdminBackfill />} />
              <Route path="bullhorn" element={<AdminBullhorn />} />
            </Route>

            <Route path="*" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

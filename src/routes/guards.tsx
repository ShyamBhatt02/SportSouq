import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';
import { safeRedirect } from '@/utils/sanitize';

/** Redirects guests to /login?redirect=… and returns them afterwards. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <PageSpinner />;
  if (status !== 'authenticated') {
    return <Navigate to={'/login?redirect=' + encodeURIComponent(location.pathname + location.search)} replace />;
  }
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <PageSpinner />;
  if (status !== 'authenticated') return <Navigate to={'/login?redirect=' + encodeURIComponent(location.pathname)} replace />;
  if (!isAdmin) return <Navigate to="/account" replace state={{ denied: true }} />;
  return <>{children}</>;
}

/** Signed-in users don't need the login/register screens. */
export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <PageSpinner />;
  if (status === 'authenticated') {
    // Honour ?redirect= so "sign in to continue" returns the shopper where they were.
    const target = safeRedirect(new URLSearchParams(location.search).get('redirect'), isAdmin ? '/admin' : '/account');
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}

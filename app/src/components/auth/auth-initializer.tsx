'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AuthPendingOverlay } from '@/components/auth/auth-pending-overlay';
import { useAuthStore } from '@/stores/auth-store';

const publicPaths = ['/login', '/signup'];

function isPublicPath(pathname: string) {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function AuthInitializer() {
  const pathname = usePathname();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const clearPendingAction = useAuthStore((s) => s.clearPendingAction);

  useEffect(() => {
    const { pendingAction, user } = useAuthStore.getState();
    const isPublic = isPublicPath(pathname);

    if (pendingAction === 'logout' && isPublic) {
      clearPendingAction();
    }

    if (
      (pendingAction === 'login' || pendingAction === 'register') &&
      !isPublic
    ) {
      clearPendingAction();
    }

    if (pendingAction === 'logout') {
      return;
    }

    if (isPublic) {
      if (!pendingAction) {
        useAuthStore.setState({ isLoading: false });
      }
      return;
    }

    fetchUser({ silent: !!user });
  }, [pathname, fetchUser, clearPendingAction]);

  return <AuthPendingOverlay />;
}

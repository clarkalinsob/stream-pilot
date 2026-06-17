'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

const publicPaths = ['/login', '/signup'];

export function AuthInitializer() {
  const pathname = usePathname();
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    const isPublic = publicPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

    if (isPublic) {
      useAuthStore.setState({ isLoading: false });
      return;
    }

    const { user } = useAuthStore.getState();
    fetchUser({ silent: !!user });
  }, [pathname, fetchUser]);

  return null;
}

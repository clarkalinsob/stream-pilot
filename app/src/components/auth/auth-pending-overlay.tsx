'use client';

import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const overlayCopy = {
  logout: 'Logging out…',
  login: 'Signing in…',
  register: 'Creating account…',
} as const;

export function AuthPendingOverlay() {
  const pendingAction = useAuthStore((s) => s.pendingAction);

  if (!pendingAction) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-[1px]"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium shadow-sm">
        <Loader2 className="size-4 animate-spin" />
        {overlayCopy[pendingAction]}
      </div>
    </div>
  );
}

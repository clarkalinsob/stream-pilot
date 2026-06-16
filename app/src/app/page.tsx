'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth, useAuthStore } from '@/hooks/use-auth';
import { apiUrl } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const logout = useAuthStore((s) => s.logout);
  const [status, setStatus] = useState('Checking API...');

  useEffect(() => {
    fetch(`${apiUrl}/health`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((health) => setStatus(`API: ${health.status} | DB: ${health.db}`))
      .catch(() => setStatus('API unreachable'));
  }, []);

  async function handleLogout() {
    await logout();
    router.push('/auth');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Stream Pilot
          </h1>
          {isLoading ? (
            <p className="mt-2 text-muted-foreground">Loading…</p>
          ) : user ? (
            <p className="mt-2 text-muted-foreground">
              Welcome back, {user.firstName}!
            </p>
          ) : null}
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{status}</p>
    </main>
  );
}

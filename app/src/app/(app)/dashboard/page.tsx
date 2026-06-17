'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiUrl } from '@/lib/api';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState('Checking API...');

  useEffect(() => {
    fetch(`${apiUrl}/health`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((health) => setStatus(`API: ${health.status} | DB: ${health.db}`))
      .catch(() => setStatus('API unreachable'));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        {isLoading && !user ? (
          <p className="mt-2 text-muted-foreground">Loading…</p>
        ) : user ? (
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.firstName}!
          </p>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">{status}</p>
    </div>
  );
}

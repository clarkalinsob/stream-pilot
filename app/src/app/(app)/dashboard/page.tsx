'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiUrl } from '@/lib/api';
import { listProductions } from '@/lib/productions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState('Checking API...');
  const [productionCount, setProductionCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/health`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((health) => setStatus(`API: ${health.status} | DB: ${health.db}`))
      .catch(() => setStatus('API unreachable'));
  }, []);

  useEffect(() => {
    listProductions({ page: 1, limit: 1 })
      .then((result) => setProductionCount(result.meta.total))
      .catch(() => setProductionCount(null));
  }, []);

  return (
    <div className="flex flex-col gap-6">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{status}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-2xl font-semibold">
              {productionCount === null ? '—' : productionCount}
            </p>
            <p className="text-sm text-muted-foreground">
              {productionCount === 1 ? 'production' : 'productions'} in your
              account
            </p>
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/productions">
                <Clapperboard />
                View Productions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

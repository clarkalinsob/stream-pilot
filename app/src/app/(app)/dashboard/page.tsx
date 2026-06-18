'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Camera,
  Clapperboard,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { fetchDashboardStats } from '@/lib/dashboard';
import { formatKpiValue } from '@/lib/dashboard-stats';
import type { DashboardStats } from '@/types/dashboard';
import { ResourceInsights } from '@/components/dashboard/resource-insights';
import { RunSheetSummary } from '@/components/dashboard/run-sheet-summary';
import { StatCard, StatCardSkeleton } from '@/components/dashboard/stat-card';
import { StatusBreakdown } from '@/components/dashboard/status-breakdown';
import { UpcomingProductionsList } from '@/components/dashboard/upcoming-productions-list';
import { ErrorAlert } from '@/components/shared/error-alert';
import { PageHeader } from '@/components/shared/page-header';

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchDashboardStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStats(null);
          setError('Unable to load dashboard analytics. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const showSkeleton = isLoading && !stats;

  const description = isAuthLoading && !user
    ? 'Loading…'
    : user
      ? `Welcome back, ${user.firstName}! Overview of your productions and resources.`
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Dashboard" description={description} />

      <div className="flex flex-col gap-4">
        {error && (
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        )}

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {showSkeleton ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Productions"
                value={formatKpiValue(stats?.productions.total)}
                icon={Clapperboard}
                href="/productions"
              />
              <StatCard
                label="Scheduled"
                value={formatKpiValue(stats?.productions.byStatus.SCHEDULED)}
                icon={Calendar}
                href="/productions"
                statusHighlight={
                  (stats?.productions.byStatus.SCHEDULED ?? 0) > 0
                    ? 'SCHEDULED'
                    : undefined
                }
              />
              <StatCard
                label="Crew members"
                value={formatKpiValue(stats?.crew.total)}
                icon={Users}
                href="/resources"
              />
              <StatCard
                label="Equipment"
                value={formatKpiValue(stats?.equipment.total)}
                icon={Camera}
                href="/resources"
              />
            </>
          )}
        </div>

        <div className="grid gap-2 lg:grid-cols-2">
          <StatusBreakdown
            byStatus={
              stats?.productions.byStatus ?? {
                DRAFT: 0,
                SCHEDULED: 0,
                COMPLETED: 0,
              }
            }
            total={stats?.productions.total ?? 0}
            isLoading={showSkeleton}
          />
          <UpcomingProductionsList
            productions={stats?.upcomingProductions ?? []}
            isLoading={showSkeleton}
          />
        </div>

        <div className="grid gap-2 lg:grid-cols-2">
          <RunSheetSummary
            totalSegments={stats?.runSheet.totalSegments ?? 0}
            totalDurationMinutes={stats?.runSheet.totalDurationMinutes ?? 0}
            isLoading={showSkeleton}
          />
          <ResourceInsights
            stats={{
              crew: stats?.crew ?? { total: 0, unassigned: 0, topBooked: [] },
              equipment: stats?.equipment ?? {
                total: 0,
                unassigned: 0,
                topBooked: [],
              },
            }}
            isLoading={showSkeleton}
          />
        </div>
      </div>
    </div>
  );
}

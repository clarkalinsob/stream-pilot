import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Package, Users } from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';
import { hasAnyResources, hasUnassignedResources } from '@/lib/dashboard-stats';
import { CrewRoleBadge } from '@/components/resources/crew-role-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ResourceInsightsProps = {
  stats: Pick<DashboardStats, 'crew' | 'equipment'>;
  isLoading?: boolean;
};

export function ResourceInsights({ stats, isLoading }: ResourceInsightsProps) {
  const hasResources = hasAnyResources(stats.crew, stats.equipment);
  const gaps = hasUnassignedResources(stats.crew, stats.equipment);

  return (
    <Card className="gap-3 py-4 shadow-none">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-base">Resource Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pt-0">
        {isLoading ? (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : (
          <>
            <div
              className={cn(
                'flex gap-2 rounded-lg border p-3',
                !hasResources
                  ? 'border-border bg-muted/40'
                  : gaps
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/40'
                    : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/40',
              )}
            >
              {!hasResources ? (
                <Package className="size-4 shrink-0 text-muted-foreground" />
              ) : gaps ? (
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <div className="space-y-0.5 text-sm">
                {!hasResources ? (
                  <>
                    <p className="font-medium">No resources yet</p>
                    <p className="text-muted-foreground">
                      Add crew members and equipment to track assignments across
                      productions.
                    </p>
                  </>
                ) : gaps ? (
                  <>
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Resources need assignment
                    </p>
                    <p className="text-amber-800/80 dark:text-amber-200/80">
                      {stats.crew.unassigned} crew member
                      {stats.crew.unassigned === 1 ? '' : 's'} and{' '}
                      {stats.equipment.unassigned} equipment item
                      {stats.equipment.unassigned === 1 ? '' : 's'} are not
                      assigned to any production.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-emerald-900 dark:text-emerald-100">
                      All resources assigned
                    </p>
                    <p className="text-emerald-800/80 dark:text-emerald-200/80">
                      Every crew member and equipment item is booked on at least
                      one production.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Top booked crew</h4>
                <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs">
                  <Link href="/resources">View all</Link>
                </Button>
              </div>
              {stats.crew.topBooked.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add crew members to track booking activity.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {stats.crew.topBooked.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between gap-3 rounded-md border px-3 py-1.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Users className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">
                          {member.name}
                        </span>
                        <CrewRoleBadge role={member.role} size="sm" />
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {member.assignmentCount}{' '}
                        {member.assignmentCount === 1 ? 'show' : 'shows'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

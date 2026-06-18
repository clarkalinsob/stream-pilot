import type { ProductionStatusCounts } from '@/types/dashboard';
import type { ProductionStatus } from '@/types/production';
import { statusBreakdown } from '@/lib/dashboard-stats';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const statusConfig: Record<
  ProductionStatus,
  { label: string; barClass: string; textClass: string }
> = {
  DRAFT: {
    label: 'Draft',
    barClass: 'bg-amber-500',
    textClass: 'text-amber-800 dark:text-amber-200',
  },
  SCHEDULED: {
    label: 'Scheduled',
    barClass: 'bg-sky-500',
    textClass: 'text-sky-800 dark:text-sky-200',
  },
  COMPLETED: {
    label: 'Completed',
    barClass: 'bg-emerald-500',
    textClass: 'text-emerald-800 dark:text-emerald-200',
  },
};

type StatusBreakdownProps = {
  byStatus: ProductionStatusCounts;
  total: number;
  isLoading?: boolean;
};

export function StatusBreakdown({
  byStatus,
  total,
  isLoading,
}: StatusBreakdownProps) {
  const items = statusBreakdown(byStatus, total);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Production Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </>
        ) : total === 0 ? (
          <p className="text-sm text-muted-foreground">
            No productions yet. Create your first production to see pipeline
            stats.
          </p>
        ) : (
          items.map((item) => {
            const config = statusConfig[item.status];
            return (
              <div key={item.status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn('font-medium', config.textClass)}>
                    {config.label}
                  </span>
                  <span className="text-muted-foreground">
                    {item.count}{' '}
                    <span className="text-xs">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all', config.barClass)}
                    style={{ width: `${item.percentage}%` }}
                    role="progressbar"
                    aria-valuenow={item.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${config.label}: ${item.percentage}%`}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

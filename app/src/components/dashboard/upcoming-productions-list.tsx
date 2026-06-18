import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import type { ProductionSummary } from '@/types/production';
import { ProductionMetaChips } from '@/components/productions/production-meta-chips';
import { ProductionStatusBadge } from '@/components/productions/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type UpcomingProductionsListProps = {
  productions: ProductionSummary[];
  isLoading?: boolean;
};

export function UpcomingProductionsList({
  productions,
  isLoading,
}: UpcomingProductionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Productions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((key) => (
              <div key={key} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : productions.length === 0 ? (
          <EmptyState
            icon={Clapperboard}
            title="No upcoming productions"
            description="Schedule a production with a future event date to see it here."
            className="border-0 p-6"
            action={
              <Button asChild size="sm">
                <Link href="/productions/new">New Production</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y">
            {productions.map((production) => (
              <li key={production.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link
                    href={`/productions/${production.id}`}
                    className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  >
                    {production.title}
                  </Link>
                  <ProductionStatusBadge status={production.status} size="sm" />
                </div>
                <ProductionMetaChips
                  production={production}
                  className="mt-2"
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

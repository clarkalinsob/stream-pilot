import Link from 'next/link';
import { Clock, ListOrdered } from 'lucide-react';
import { formatDuration } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type RunSheetSummaryProps = {
  totalSegments: number;
  totalDurationMinutes: number;
  isLoading?: boolean;
};

export function RunSheetSummary({
  totalSegments,
  totalDurationMinutes,
  isLoading,
}: RunSheetSummaryProps) {
  return (
    <Card className="gap-3 py-4 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
        <CardTitle className="text-base">Run Sheet Summary</CardTitle>
        <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs">
          <Link href="/productions">View productions</Link>
        </Button>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        {isLoading ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-3.5" />
                <span className="text-xs">Total planned airtime</span>
              </div>
              <p className="mt-1.5 text-xl font-semibold">
                {formatDuration(totalDurationMinutes)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ListOrdered className="size-3.5" />
                <span className="text-xs">Total segments</span>
              </div>
              <p className="mt-1.5 text-xl font-semibold">{totalSegments}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

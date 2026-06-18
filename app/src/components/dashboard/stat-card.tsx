import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { ProductionStatus } from '@/types/production';
import { getProductionStatusHighlight } from '@/components/productions/status-badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  isLoading?: boolean;
  className?: string;
  statusHighlight?: ProductionStatus;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  isLoading,
  className,
  statusHighlight,
}: StatCardProps) {
  const highlight = statusHighlight
    ? getProductionStatusHighlight(statusHighlight)
    : null;

  const content = (
    <Card
      className={cn(
        'gap-2 py-3 shadow-none',
        highlight && 'border-2',
        highlight?.card,
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon
          className={cn(
            'size-3.5',
            highlight ? highlight.icon : 'text-muted-foreground',
          )}
          aria-hidden
        />
      </CardHeader>
      <CardContent className="px-4 pt-0">
        {isLoading ? (
          <Skeleton className="h-6 w-12" />
        ) : (
          <p className="text-xl font-semibold tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-2 py-3 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="size-3.5 rounded-full" />
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <Skeleton className="h-6 w-16" />
      </CardContent>
    </Card>
  );
}

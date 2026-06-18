import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
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
};

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  isLoading,
  className,
}: StatCardProps) {
  const content = (
    <Card className={cn('gap-2 py-3 shadow-none', className)}>
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="size-3.5 text-muted-foreground" aria-hidden />
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
    <Card className="gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between px-5 pb-0">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4 rounded-full" />
      </CardHeader>
      <CardContent className="px-5">
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

import type { ProductionStatus } from '@/types/production';
import { cn } from '@/lib/utils';

export const PRODUCTION_STATUSES: ProductionStatus[] = [
  'DRAFT',
  'SCHEDULED',
  'COMPLETED',
];

const statusStyles: Record<
  ProductionStatus,
  { label: string; badge: string; card: string; icon: string }
> = {
  DRAFT: {
    label: 'Draft',
    badge:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200',
    card: 'border-amber-200 dark:border-amber-800/50',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  SCHEDULED: {
    label: 'Scheduled',
    badge:
      'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-200',
    card: 'border-sky-200 dark:border-sky-800/50',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  COMPLETED: {
    label: 'Completed',
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200',
    card: 'border-emerald-200 dark:border-emerald-800/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
};

export function getProductionStatusHighlight(status: ProductionStatus) {
  return statusStyles[status];
}

export function getProductionStatusLabel(status: ProductionStatus) {
  return statusStyles[status].label;
}

type ProductionStatusBadgeProps = {
  status: ProductionStatus;
  className?: string;
  size?: 'sm' | 'md';
};

export function ProductionStatusBadge({
  status,
  className,
  size = 'md',
}: ProductionStatusBadgeProps) {
  const config = statusStyles[status];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        config.badge,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

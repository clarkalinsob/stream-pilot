import type { ProductionStatus } from '@/types/production';
import { cn } from '@/lib/utils';

const statusStyles: Record<
  ProductionStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: 'Draft',
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200',
  },
  SCHEDULED: {
    label: 'Scheduled',
    className:
      'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-200',
  },
  COMPLETED: {
    label: 'Completed',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
};

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
        'inline-flex shrink-0 items-center rounded-full border font-semibold uppercase tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

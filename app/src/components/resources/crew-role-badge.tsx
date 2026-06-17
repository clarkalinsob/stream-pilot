import type { CrewRole } from '@/types/crew';
import { formatCrewRole } from '@/lib/resources';
import { cn } from '@/lib/utils';

export const crewRoleBadgeClasses =
  'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-200';

type CrewRoleBadgeProps = {
  role: CrewRole;
  className?: string;
  size?: 'sm' | 'md';
};

export function CrewRoleBadge({
  role,
  className,
  size = 'md',
}: CrewRoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border font-semibold',
        crewRoleBadgeClasses,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className,
      )}
    >
      {formatCrewRole(role)}
    </span>
  );
}

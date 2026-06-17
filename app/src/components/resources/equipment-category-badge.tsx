import type { EquipmentCategory } from '@/types/equipment';
import { formatEquipmentCategory } from '@/lib/resources';
import { cn } from '@/lib/utils';

export const equipmentCategoryBadgeClasses =
  'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-200';

type EquipmentCategoryBadgeProps = {
  category: EquipmentCategory;
  className?: string;
  size?: 'sm' | 'md';
};

export function EquipmentCategoryBadge({
  category,
  className,
  size = 'md',
}: EquipmentCategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border font-semibold',
        equipmentCategoryBadgeClasses,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className,
      )}
    >
      {formatEquipmentCategory(category)}
    </span>
  );
}

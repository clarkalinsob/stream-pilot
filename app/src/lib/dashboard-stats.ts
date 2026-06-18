import type {
  DashboardStats,
  ProductionStatusCounts,
} from '@/types/dashboard';
import type { ProductionStatus } from '@/types/production';

export type StatusBreakdownItem = {
  status: ProductionStatus;
  count: number;
  percentage: number;
};

const STATUS_ORDER: ProductionStatus[] = ['DRAFT', 'SCHEDULED', 'COMPLETED'];

export function statusBreakdown(
  byStatus: ProductionStatusCounts,
  total: number,
): StatusBreakdownItem[] {
  return STATUS_ORDER.map((status) => {
    const count = byStatus[status];
    const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
    return { status, count, percentage };
  });
}

export function hasResourceGaps(stats: DashboardStats): boolean {
  return hasUnassignedResources(stats.crew, stats.equipment);
}

export function hasAnyResources(
  crew: { total: number },
  equipment: { total: number },
): boolean {
  return crew.total > 0 || equipment.total > 0;
}

export function hasUnassignedResources(
  crew: { unassigned: number },
  equipment: { unassigned: number },
): boolean {
  return crew.unassigned > 0 || equipment.unassigned > 0;
}

export function totalUnassignedResources(stats: DashboardStats): number {
  return stats.crew.unassigned + stats.equipment.unassigned;
}

export function formatKpiValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

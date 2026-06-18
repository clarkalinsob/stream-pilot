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

export const TOP_BOOKED_DISPLAY_LIMIT = 3;

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

export function formatUnassignedResourcesMessage(
  crew: { unassigned: number },
  equipment: { unassigned: number },
): string {
  const parts: string[] = [];

  if (crew.unassigned > 0) {
    parts.push(
      `${crew.unassigned} crew member${crew.unassigned === 1 ? '' : 's'}`,
    );
  }

  if (equipment.unassigned > 0) {
    parts.push(
      `${equipment.unassigned} equipment item${equipment.unassigned === 1 ? '' : 's'}`,
    );
  }

  if (parts.length === 0) return '';

  const subject =
    parts.length === 1 ? parts[0] : `${parts[0]} and ${parts[1]}`;
  const totalUnassigned = crew.unassigned + equipment.unassigned;
  const verb = totalUnassigned === 1 ? 'is' : 'are';

  return `${subject} ${verb} not assigned to any production.`;
}

export function formatKpiValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

import { describe, expect, it } from 'vitest';
import {
  formatKpiValue,
  formatUnassignedResourcesMessage,
  hasAnyResources,
  hasResourceGaps,
  statusBreakdown,
  totalUnassignedResources,
} from '@/lib/dashboard-stats';
import type { DashboardStats } from '@/types/dashboard';

const baseStats: DashboardStats = {
  productions: {
    total: 10,
    byStatus: { DRAFT: 3, SCHEDULED: 5, COMPLETED: 2 },
  },
  crew: { total: 8, unassigned: 2, topBooked: [] },
  equipment: { total: 12, unassigned: 1, topBooked: [] },
  runSheet: { totalSegments: 24, totalDurationMinutes: 360 },
  upcomingProductions: [],
};

describe('statusBreakdown', () => {
  it('returns percentages for each status', () => {
    const result = statusBreakdown(baseStats.productions.byStatus, 10);

    expect(result).toEqual([
      { status: 'DRAFT', count: 3, percentage: 30 },
      { status: 'SCHEDULED', count: 5, percentage: 50 },
      { status: 'COMPLETED', count: 2, percentage: 20 },
    ]);
  });

  it('returns zero percentages when total is zero', () => {
    const result = statusBreakdown(
      { DRAFT: 0, SCHEDULED: 0, COMPLETED: 0 },
      0,
    );

    expect(result.every((item) => item.percentage === 0)).toBe(true);
  });
});

describe('hasAnyResources', () => {
  it('returns false when crew and equipment totals are zero', () => {
    expect(
      hasAnyResources(
        { total: 0 },
        { total: 0 },
      ),
    ).toBe(false);
  });

  it('returns true when crew or equipment exists', () => {
    expect(hasAnyResources({ total: 1 }, { total: 0 })).toBe(true);
    expect(hasAnyResources({ total: 0 }, { total: 1 })).toBe(true);
  });
});

describe('hasResourceGaps', () => {
  it('returns true when crew or equipment is unassigned', () => {
    expect(hasResourceGaps(baseStats)).toBe(true);
  });

  it('returns false when all resources are assigned', () => {
    expect(
      hasResourceGaps({
        ...baseStats,
        crew: { ...baseStats.crew, unassigned: 0 },
        equipment: { ...baseStats.equipment, unassigned: 0 },
      }),
    ).toBe(false);
  });
});

describe('totalUnassignedResources', () => {
  it('sums unassigned crew and equipment', () => {
    expect(totalUnassignedResources(baseStats)).toBe(3);
  });
});

describe('formatUnassignedResourcesMessage', () => {
  it('mentions only crew when equipment is fully assigned', () => {
    expect(
      formatUnassignedResourcesMessage(
        { unassigned: 1 },
        { unassigned: 0 },
      ),
    ).toBe('1 crew member is not assigned to any production.');
  });

  it('mentions only equipment when crew is fully assigned', () => {
    expect(
      formatUnassignedResourcesMessage(
        { unassigned: 0 },
        { unassigned: 2 },
      ),
    ).toBe('2 equipment items are not assigned to any production.');
  });

  it('combines crew and equipment when both are unassigned', () => {
    expect(
      formatUnassignedResourcesMessage(
        { unassigned: 1 },
        { unassigned: 1 },
      ),
    ).toBe(
      '1 crew member and 1 equipment item are not assigned to any production.',
    );
  });
});

describe('formatKpiValue', () => {
  it('formats numbers as strings', () => {
    expect(formatKpiValue(42)).toBe('42');
  });

  it('returns em dash for nullish values', () => {
    expect(formatKpiValue(null)).toBe('—');
    expect(formatKpiValue(undefined)).toBe('—');
  });
});

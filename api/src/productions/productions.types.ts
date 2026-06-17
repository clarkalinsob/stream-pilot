import { Production, ProductionStatus, RunSheetItem } from '@prisma/client';

export type RunSheetItemResponse = {
  id: string;
  sequence: number;
  title: string;
  durationMinutes: number | null;
  notes: string | null;
};

export type ProductionSummary = {
  id: string;
  title: string;
  eventDate: string | null;
  status: ProductionStatus;
  segmentCount: number;
  totalDurationMinutes: number;
};

export type ProductionDetail = ProductionSummary & {
  description: string | null;
  runSheetItems: RunSheetItemResponse[];
  createdAt: string;
  updatedAt: string;
};

type ProductionWithItems = Production & {
  runSheetItems: RunSheetItem[];
};

type ProductionWithCount = Production & {
  _count: { runSheetItems: number };
  runSheetItems: { durationMinutes: number | null }[];
};

export function toRunSheetItemResponse(item: RunSheetItem): RunSheetItemResponse {
  return {
    id: item.id,
    sequence: item.sequence,
    title: item.title,
    durationMinutes: item.durationMinutes,
    notes: item.notes,
  };
}

function sumDurationMinutes(items: { durationMinutes: number | null }[]): number {
  return items.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
}

export function toProductionSummary(production: ProductionWithCount): ProductionSummary {
  return {
    id: production.id,
    title: production.title,
    eventDate: production.eventDate?.toISOString() ?? null,
    status: production.status,
    segmentCount: production._count.runSheetItems,
    totalDurationMinutes: sumDurationMinutes(production.runSheetItems),
  };
}

export function toProductionDetail(production: ProductionWithItems): ProductionDetail {
  const items = production.runSheetItems.map(toRunSheetItemResponse);

  return {
    id: production.id,
    title: production.title,
    description: production.description,
    eventDate: production.eventDate?.toISOString() ?? null,
    status: production.status,
    segmentCount: items.length,
    totalDurationMinutes: sumDurationMinutes(production.runSheetItems),
    runSheetItems: items,
    createdAt: production.createdAt.toISOString(),
    updatedAt: production.updatedAt.toISOString(),
  };
}

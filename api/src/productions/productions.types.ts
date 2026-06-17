import { Production, ProductionStatus, RunSheetItem } from '@prisma/client';
import { toDateString, toTimeString } from './event-schedule';

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
  startTime: string | null;
  endTime: string | null;
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

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedProductionsResponse = {
  data: ProductionSummary[];
  meta: PaginationMeta;
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

function toScheduleFields(production: Production) {
  return {
    eventDate: toDateString(production.eventDate),
    startTime: toTimeString(production.startTime),
    endTime: toTimeString(production.endTime),
  };
}

export function toProductionSummary(production: ProductionWithCount): ProductionSummary {
  return {
    id: production.id,
    title: production.title,
    ...toScheduleFields(production),
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
    ...toScheduleFields(production),
    status: production.status,
    segmentCount: items.length,
    totalDurationMinutes: sumDurationMinutes(production.runSheetItems),
    runSheetItems: items,
    createdAt: production.createdAt.toISOString(),
    updatedAt: production.updatedAt.toISOString(),
  };
}

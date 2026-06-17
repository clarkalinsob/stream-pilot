import type { RunSheetItem, RunSheetItemResponse } from '@/types/production';
import { buildEventStartDate } from '@/lib/format';

export type RunSheetSegmentDraft = {
  clientId: string;
  title: string;
  durationMinutes?: number;
  notes?: string;
};

function newClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `seg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createEmptySegment(): RunSheetSegmentDraft {
  return {
    clientId: newClientId(),
    title: '',
    durationMinutes: undefined,
    notes: '',
  };
}

export function fromApiItems(items: RunSheetItemResponse[]): RunSheetSegmentDraft[] {
  return items.map((item) => ({
    clientId: item.id,
    title: item.title,
    durationMinutes: item.durationMinutes ?? undefined,
    notes: item.notes ?? '',
  }));
}

export function toApiPayload(items: RunSheetSegmentDraft[]): RunSheetItem[] {
  return items.map(({ title, durationMinutes, notes }) => ({
    title: title.trim(),
    ...(durationMinutes !== undefined && durationMinutes > 0
      ? { durationMinutes }
      : {}),
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
  }));
}

export function reorderById<T extends { clientId: string }>(
  items: T[],
  activeId: string,
  overId: string,
): T[] {
  const oldIndex = items.findIndex((item) => item.clientId === activeId);
  const newIndex = items.findIndex((item) => item.clientId === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return items;

  const next = [...items];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  return next;
}

export function sumDurationMinutes(items: { durationMinutes?: number }[]): number {
  return items.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
}

export function computeSegmentStartTimes(
  eventDate: string | null | undefined,
  startTime: string | null | undefined,
  items: { durationMinutes?: number | null }[],
): (Date | null)[] {
  const eventStart = buildEventStartDate(eventDate, startTime);
  if (!eventStart) return items.map(() => null);

  let offsetMinutes = 0;
  return items.map((item) => {
    const segmentStart = new Date(eventStart.getTime() + offsetMinutes * 60_000);
    offsetMinutes += item.durationMinutes ?? 0;
    return segmentStart;
  });
}

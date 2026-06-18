export function toDateString(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export function toTimeString(value: Date | null | undefined): string | null {
  if (!value) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`;
}

export function parseDateString(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function parseTimeString(value: string): Date {
  const [hours = '0', minutes = '0'] = value.split(':');
  return new Date(
    Date.UTC(1970, 0, 1, Number(hours), Number(minutes), 0, 0),
  );
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [hours = 0, mins = 0] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

export function sumDurationMinutes(
  items: { durationMinutes?: number | null }[],
): number {
  return items.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
}

export function computeEndTimeDate(
  startTime: string | null | undefined,
  durationMinutes: number,
): Date | null {
  if (!startTime || durationMinutes <= 0) return null;
  return parseTimeString(addMinutesToTime(startTime, durationMinutes));
}

export function isWithinHoursBeforeEvent(
  eventDateTime: Date,
  now: Date,
  hoursBefore: number,
): boolean {
  const msUntilEvent = eventDateTime.getTime() - now.getTime();
  if (msUntilEvent <= 0) {
    return false;
  }

  const minuteMs = 60 * 1000;
  const targetMinutes = hoursBefore * 60;
  const minutesUntil = msUntilEvent / minuteMs;
  return minutesUntil > targetMinutes - 1 && minutesUntil <= targetMinutes;
}

export function formatTimeUntilEvent(
  eventDateTime: Date,
  now: Date = new Date(),
): string {
  const msUntil = eventDateTime.getTime() - now.getTime();
  if (msUntil <= 0) {
    return 'starting now';
  }

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (msUntil >= dayMs) {
    const days = Math.floor(msUntil / dayMs);
    return `${days} day${days === 1 ? '' : 's'}`;
  }

  if (msUntil >= hourMs) {
    const hours = Math.floor(msUntil / hourMs);
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const minutes = Math.max(1, Math.floor(msUntil / minuteMs));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

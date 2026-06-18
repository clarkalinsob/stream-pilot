export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return formatMinutesOnly(0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return formatMinutesOnly(minutes);
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatMinutesOnly(totalMinutes: number): string {
  return `${totalMinutes} min${totalMinutes === 1 ? '' : 's'}`;
}

export function formatSegmentDuration(
  totalMinutes: number | null | undefined,
): string {
  if (totalMinutes === null || totalMinutes === undefined || totalMinutes <= 0) {
    return '—';
  }
  return formatMinutesOnly(totalMinutes);
}

export function formatClockTime(date: Date): string {
  return date
    .toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase()
    .replace(/\s/g, '');
}

export function formatEventDate(date: string | null): string {
  if (!date) return 'No date set';
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeValue(time: string | null): string {
  if (!time) return '—';
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return formatClockTime(date);
}

export function buildEventStartDate(
  eventDate: string | null | undefined,
  startTime: string | null | undefined,
): Date | null {
  if (!eventDate || !startTime) return null;
  const [year, month, day] = eventDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function toStartsAt(
  eventDate: string,
  startTime: string,
): string {
  const start = buildEventStartDate(eventDate, startTime);
  if (!start) {
    throw new Error('Event date and start time are required');
  }
  return start.toISOString();
}

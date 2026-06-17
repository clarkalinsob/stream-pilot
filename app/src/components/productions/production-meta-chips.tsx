import { Calendar, Clock, ListOrdered, Timer } from 'lucide-react';
import { formatDuration, formatEventDate, formatTimeValue } from '@/lib/format';
import type { ProductionSummary } from '@/types/production';
import { cn } from '@/lib/utils';

type ProductionMetaChipsProps = {
  production: Pick<
    ProductionSummary,
    'eventDate' | 'startTime' | 'endTime' | 'segmentCount' | 'totalDurationMinutes'
  >;
  className?: string;
};

export function ProductionMetaChips({
  production,
  className,
}: ProductionMetaChipsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground">
        <Calendar className="size-3.5" />
        {formatEventDate(production.eventDate)}
      </span>
      {(production.startTime || production.endTime) && (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground">
          <Timer className="size-3.5" />
          {production.startTime ? formatTimeValue(production.startTime) : '—'}
          {production.endTime ? ` - ${formatTimeValue(production.endTime)}` : ''}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground">
        <ListOrdered className="size-3.5" />
        {production.segmentCount}{' '}
        {production.segmentCount === 1 ? 'segment' : 'segments'}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        {formatDuration(production.totalDurationMinutes)} total
      </span>
    </div>
  );
}

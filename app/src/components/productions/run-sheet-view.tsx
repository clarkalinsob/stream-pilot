'use client';

import { useMemo } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputWithCharacterCount } from '@/components/shared/character-count';
import { Textarea } from '@/components/ui/textarea';
import {
  DragHandle,
  SortableList,
  useSortableRow,
} from '@/components/shared/sortable-list';
import {
  formatClockTime,
  formatDuration,
  formatEventDate,
  formatSegmentDuration,
  formatTimeValue,
} from '@/lib/format';
import {
  computeSegmentStartTimes,
  createEmptySegment,
  reorderById,
  sumDurationMinutes,
  type RunSheetSegmentDraft,
} from '@/lib/run-sheet';
import { cn } from '@/lib/utils';

const END_OF_RUN_SHEET_TITLE = 'Program End';

export type RunSheetSegmentDisplay = {
  sequence: number;
  title: string;
  durationMinutes?: number | null;
  notes?: string | null;
};

type RunSheetViewProps = {
  productionTitle?: string;
  eventDate?: string | null;
  startTime?: string | null;
  segments: RunSheetSegmentDisplay[];
  totalDurationMinutes: number;
  className?: string;
  isEditing?: boolean;
  draftItems?: RunSheetSegmentDraft[];
  onDraftChange?: (items: RunSheetSegmentDraft[]) => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  saveDisabled?: boolean;
  segmentErrors?: Record<string, string>;
  onSegmentTitleBlur?: (clientId: string) => void;
};

type EditableRunSheetRowProps = {
  item: RunSheetSegmentDraft;
  index: number;
  totalItems: number;
  startTime: Date | null;
  onUpdate: (patch: Partial<RunSheetSegmentDraft>) => void;
  onRemove: () => void;
  titleError?: string;
  onTitleBlur?: () => void;
};

function SegmentTime({ startTime }: { startTime: Date | null }) {
  if (!startTime) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className="font-medium tabular-nums text-foreground">
      {formatClockTime(startTime)}
    </span>
  );
}

function EndOfRunSheetRow({
  endTime,
  isEditing = false,
}: {
  endTime: Date | null;
  isEditing?: boolean;
}) {
  return (
    <tr className="border-t border-border/80 bg-muted/20 print:bg-transparent">
      {isEditing ? (
        <td className="w-10 py-3 pr-3 align-top" aria-hidden />
      ) : null}
      <td className="w-10 py-3 pr-3 align-top" aria-hidden />
      <td className="py-3 pr-4 align-top font-medium whitespace-nowrap text-muted-foreground">
        {endTime ? (
          <span className="tabular-nums">{formatClockTime(endTime)}</span>
        ) : (
          '—'
        )}
      </td>
      <td className="max-w-0 break-words py-3 pr-4 align-top font-medium text-muted-foreground [overflow-wrap:anywhere]">
        {END_OF_RUN_SHEET_TITLE}
      </td>
      <td className="py-3 pr-4 align-top text-right text-muted-foreground whitespace-nowrap" />
      <td className="max-w-0 py-3 align-top text-muted-foreground" />
    </tr>
  );
}

function EditableRunSheetRow({
  item,
  index,
  totalItems,
  startTime,
  onUpdate,
  onRemove,
  titleError,
  onTitleBlur,
}: EditableRunSheetRowProps) {
  const { setNodeRef, style, isDragging, dragHandleProps } = useSortableRow(
    item.clientId,
  );

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-b border-border/60 last:border-0',
        isDragging && 'relative z-10 bg-card shadow-md',
      )}
    >
      <td className="w-10 py-2 pr-3 align-middle">
        <DragHandle
          dragHandleProps={dragHandleProps}
          isDragging={isDragging}
          label={`Reorder segment ${index + 1}`}
        />
      </td>
      <td className="w-10 py-2 pr-3 align-middle font-mono text-sm tabular-nums text-muted-foreground">
        {index + 1}
      </td>
      <td className="py-2 pr-4 align-middle whitespace-nowrap">
        <SegmentTime startTime={startTime} />
      </td>
      <td className="max-w-0 py-2 pr-4 align-top">
        <InputWithCharacterCount
          className="h-8"
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          onBlur={onTitleBlur}
          placeholder="Segment title"
          aria-label={`Segment ${index + 1} title`}
        />
        {titleError ? (
          <FieldError className="mt-1 text-xs">{titleError}</FieldError>
        ) : null}
      </td>
      <td className="py-2 pr-4 align-top">
        <Input
          className="h-8"
          type="number"
          min={1}
          value={item.durationMinutes ?? ''}
          onChange={(e) =>
            onUpdate({
              durationMinutes: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          placeholder="mins"
          aria-label={`Segment ${index + 1} duration in minutes`}
        />
      </td>
      <td className="max-w-0 py-2 align-top">
        <div className="flex items-start gap-1">
          <Textarea
            className="min-h-8 flex-1 resize-none py-1.5"
            value={item.notes ?? ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Notes"
            rows={1}
            aria-label={`Segment ${index + 1} notes`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            disabled={totalItems <= 1}
            onClick={onRemove}
            aria-label={`Remove segment ${index + 1}`}
          >
            <Trash2 />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function RunSheetView({
  productionTitle,
  eventDate,
  startTime,
  segments,
  totalDurationMinutes,
  className,
  isEditing = false,
  draftItems = [],
  onDraftChange,
  onEdit,
  onCancel,
  onSave,
  isSaving = false,
  saveDisabled = false,
  segmentErrors,
  onSegmentTitleBlur,
}: RunSheetViewProps) {
  const segmentCount = isEditing ? draftItems.length : segments.length;
  const runtime = isEditing
    ? sumDurationMinutes(draftItems)
    : totalDurationMinutes;
  const showEditAction = !isEditing && Boolean(onEdit);
  const showSaveActions =
    isEditing && (Boolean(onCancel) || Boolean(onSave));

  const timedSegments = isEditing ? draftItems : segments;
  const startTimes = useMemo(
    () => computeSegmentStartTimes(eventDate, startTime, timedSegments),
    [eventDate, startTime, timedSegments],
  );
  const computedEndTime = useMemo(() => {
    const firstStart = startTimes[0];
    if (!firstStart || runtime <= 0) return null;
    return new Date(firstStart.getTime() + runtime * 60_000);
  }, [startTimes, runtime]);

  function updateDraft(index: number, patch: Partial<RunSheetSegmentDraft>) {
    if (!onDraftChange) return;
    onDraftChange(
      draftItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeDraft(index: number) {
    if (!onDraftChange) return;
    onDraftChange(draftItems.filter((_, i) => i !== index));
  }

  function handleReorder(activeId: string, overId: string) {
    if (!onDraftChange) return;
    onDraftChange(reorderById(draftItems, activeId, overId));
  }

  const tableHead = (
    <thead>
      <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {isEditing ? (
          <>
            <th className="w-10 pb-3 pr-3" aria-label="Reorder" />
            <th className="w-10 pb-3 pr-3">#</th>
          </>
        ) : (
          <th className="w-10 pb-3 pr-3">#</th>
        )}
        <th className="w-24 pb-3 pr-4">Time</th>
        <th className="w-[26%] pb-3 pr-4">Segment</th>
        <th className="w-32 pb-3 pr-4 text-right">Duration (mins)</th>
        <th className="pb-3">Notes</th>
      </tr>
    </thead>
  );

  const tableBody = (
    <tbody>
      {isEditing
        ? draftItems.map((item, index) => (
            <EditableRunSheetRow
              key={item.clientId}
              item={item}
              index={index}
              totalItems={draftItems.length}
              startTime={startTimes[index] ?? null}
              onUpdate={(patch) => updateDraft(index, patch)}
              onRemove={() => removeDraft(index)}
              titleError={segmentErrors?.[item.clientId]}
              onTitleBlur={() => onSegmentTitleBlur?.(item.clientId)}
            />
          ))
        : segments.map((segment, index) => (
            <tr
              key={segment.sequence}
              className="border-b border-border/60"
            >
              <td className="py-3 pr-3 align-top font-mono text-muted-foreground">
                {segment.sequence}
              </td>
              <td className="py-3 pr-4 align-top whitespace-nowrap">
                <SegmentTime startTime={startTimes[index] ?? null} />
              </td>
              <td className="max-w-0 break-words py-3 pr-4 align-top font-medium [overflow-wrap:anywhere]">
                {segment.title}
              </td>
              <td className="py-3 pr-4 align-top text-right text-muted-foreground whitespace-nowrap">
                {formatSegmentDuration(segment.durationMinutes)}
              </td>
              <td className="max-w-0 break-words py-3 align-top text-muted-foreground [overflow-wrap:anywhere]">
                {segment.notes?.trim() || '—'}
              </td>
            </tr>
          ))}
      <EndOfRunSheetRow endTime={computedEndTime} isEditing={isEditing} />
    </tbody>
  );

  const table = (
    <table className="w-full table-fixed border-collapse text-sm">
      {tableHead}
      {tableBody}
    </table>
  );

  return (
    <article
      className={cn(
        'run-sheet-document w-full overflow-hidden rounded-lg border bg-card shadow-sm',
        'print:w-full print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none',
        className,
      )}
    >
      <header className="border-b px-6 py-4 print:border-0 print:px-0 print:pb-3 print:pt-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight print:text-black">
              Run Sheet
            </h2>
            {(productionTitle || eventDate) && (
              <div className="mt-1 hidden print:block">
                {productionTitle && (
                  <h2 className="break-words text-xl font-semibold tracking-tight">
                    {productionTitle}
                  </h2>
                )}
                <p className="mt-1 text-sm text-muted-foreground print:text-black">
                  {eventDate ? (
                    <>
                      {formatEventDate(eventDate)}
                      <span className="mx-2">·</span>
                    </>
                  ) : null}
                  {segmentCount}{' '}
                  {segmentCount === 1 ? 'segment' : 'segments'}
                  <span className="mx-2">·</span>
                  {formatDuration(runtime)} total runtime
                </p>
              </div>
            )}
            {isEditing && productionTitle && (
              <p className="mt-1 font-medium print:hidden">{productionTitle}</p>
            )}
            {isEditing && eventDate && (
              <p className="mt-1 text-sm text-muted-foreground print:hidden">
                {formatEventDate(eventDate)}
                {startTime ? (
                  <>
                    <span className="mx-2">·</span>
                    Starts {formatTimeValue(startTime)}
                  </>
                ) : null}
              </p>
            )}
            {!isEditing && (
              <div className="mt-1 space-y-1 text-sm text-muted-foreground print:hidden">
                <p>
                  {eventDate ? (
                    <>
                      {formatEventDate(eventDate)}
                      <span className="mx-2">·</span>
                    </>
                  ) : null}
                  {segmentCount}{' '}
                  {segmentCount === 1 ? 'segment' : 'segments'}
                  <span className="mx-2">·</span>
                  {formatDuration(runtime)} total runtime
                </p>
              </div>
            )}
            {!isEditing && (!eventDate || !startTime) && segmentCount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground print:hidden">
                Set an event date and start time above to show segment times.
              </p>
            )}
          </div>
          {(showEditAction || showSaveActions) && (
            <div className="flex shrink-0 gap-2 print:hidden">
              {showSaveActions ? (
                <>
                  {onCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      onClick={onCancel}
                    >
                      Cancel
                    </Button>
                  )}
                  {onSave && (
                    <Button
                      size="sm"
                      loading={isSaving}
                      disabled={isSaving || saveDisabled}
                      onClick={onSave}
                    >
                      {isSaving ? 'Saving…' : 'Save'}
                    </Button>
                  )}
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Pencil />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="overflow-x-auto px-6 py-4 print:overflow-visible print:px-0 print:py-2">
        {isEditing ? (
          <div className="space-y-3">
            <SortableList
              itemIds={draftItems.map((item) => item.clientId)}
              onReorder={handleReorder}
            >
              {table}
            </SortableList>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="print:hidden"
              onClick={() =>
                onDraftChange?.([...draftItems, createEmptySegment()])
              }
            >
              <Plus />
              Add segment
            </Button>
          </div>
        ) : (
          table
        )}
      </div>
    </article>
  );
}

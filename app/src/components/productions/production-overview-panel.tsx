'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ProductionDetailsFields,
  type ProductionDetailsValues,
} from './production-details-fields';
import { ProductionMetaChips } from './production-meta-chips';
import { ProductionStatusBadge } from './status-badge';

type ProductionOverviewPanelProps = {
  values: ProductionDetailsValues;
  endTime?: string | null;
  onChange: (values: ProductionDetailsValues) => void;
  segmentCount: number;
  totalDurationMinutes: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveDisabled: boolean;
  errors?: Partial<Record<'title' | 'eventDate' | 'startTime', string>>;
  onFieldBlur?: (field: 'title' | 'eventDate' | 'startTime') => void;
};


export function ProductionOverviewPanel({
  values,
  endTime,
  onChange,
  segmentCount,
  totalDurationMinutes,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  isSaving,
  saveDisabled,
  errors,
  onFieldBlur,
}: ProductionOverviewPanelProps) {
  return (
    <section className="rounded-xl border bg-gradient-to-br from-muted/50 via-background to-background p-6 print:hidden">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="max-w-2xl space-y-5">
              <h2 className="text-lg font-semibold tracking-tight">
                Production details
              </h2>
              <ProductionDetailsFields
                values={values}
                onChange={onChange}
                showStatus
                compact
                errors={errors}
                onFieldBlur={onFieldBlur}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {values.title}
                </h1>
                {values.status && (
                  <ProductionStatusBadge status={values.status} />
                )}
              </div>
              <ProductionMetaChips
                production={{
                  eventDate: values.eventDate || null,
                  startTime: values.startTime || null,
                  endTime: endTime ?? null,
                  segmentCount,
                  totalDurationMinutes,
                }}
              />
              {values.description?.trim() ? (
                <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {values.description}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 print:hidden sm:pt-1">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={isSaving}
                disabled={isSaving || saveDisabled}
                onClick={onSave}
              >
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil />
              Edit
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

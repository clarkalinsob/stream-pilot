'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DangerZone } from '@/components/shared/danger-zone';
import { ErrorAlert } from '@/components/shared/error-alert';
import { ProductionOverviewPanel } from '@/components/productions/production-overview-panel';
import type { ProductionDetailsValues } from '@/components/productions/production-details-fields';
import { RunSheetView } from '@/components/productions/run-sheet-view';
import { fromApiItems, toApiPayload, type RunSheetSegmentDraft } from '@/lib/run-sheet';
import { useProductionsStore } from '@/stores/productions-store';

export default function ProductionDetailPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
      <ProductionDetailContent />
    </Suspense>
  );
}

function ProductionDetailContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    current,
    isLoading,
    isSaving,
    error,
    fetchProduction,
    updateProduction,
    replaceRunSheet,
    deleteProduction,
    clearError,
    clearCurrent,
  } = useProductionsStore();

  const [showDelete, setShowDelete] = useState(false);
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [isEditingRunSheet, setIsEditingRunSheet] = useState(false);

  const [details, setDetails] = useState<ProductionDetailsValues>({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    status: 'DRAFT',
  });
  const [detailsDirty, setDetailsDirty] = useState(false);

  const [segments, setSegments] = useState<RunSheetSegmentDraft[]>([]);
  const [segmentsDirty, setSegmentsDirty] = useState(false);

  useEffect(() => {
    fetchProduction(id);
    return () => clearCurrent();
  }, [id, fetchProduction, clearCurrent]);

  function syncFromCurrent() {
    if (!current) return;
    setDetails({
      title: current.title,
      description: current.description ?? '',
      eventDate: current.eventDate ?? '',
      startTime: current.startTime ?? '',
      status: current.status,
    });
    setSegments(fromApiItems(current.runSheetItems));
    setDetailsDirty(false);
    setSegmentsDirty(false);
  }

  useEffect(() => {
    syncFromCurrent();
    setIsEditingOverview(false);
    setIsEditingRunSheet(false);
  }, [current]);

  function handleDetailsChange(values: ProductionDetailsValues) {
    setDetails(values);
    setDetailsDirty(true);
  }

  function handleSegmentsChange(items: RunSheetSegmentDraft[]) {
    setSegments(items);
    setSegmentsDirty(true);
  }

  function handleCancelOverviewEdit() {
    syncFromCurrent();
    setIsEditingOverview(false);
  }

  function handleCancelRunSheetEdit() {
    syncFromCurrent();
    setIsEditingRunSheet(false);
  }

  async function handleSaveDetails() {
    if (!current) return;
    try {
      await updateProduction(id, {
        title: details.title.trim(),
        description: details.description.trim() || null,
        eventDate: details.eventDate || null,
        startTime: details.startTime || null,
        status: details.status,
      });
      setDetailsDirty(false);
      setIsEditingOverview(false);
    } catch {
      // error in store
    }
  }

  async function handleSaveRunSheet() {
    if (!current || segments.length === 0) return;
    if (!segments.every((s) => s.title.trim())) return;
    try {
      await replaceRunSheet(id, toApiPayload(segments));
      setSegmentsDirty(false);
      setIsEditingRunSheet(false);
    } catch {
      // error in store
    }
  }

  async function handleDelete() {
    try {
      await deleteProduction(id);
      router.push('/productions');
    } catch {
      setShowDelete(false);
    }
  }

  if (isLoading && !current) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!current && !isLoading) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error ?? 'Production not found.'} />
        <Button variant="outline" onClick={() => router.push('/productions')}>
          Back to productions
        </Button>
      </div>
    );
  }

  if (!current) return null;

  const runSheetSegments = current.runSheetItems.map((item) => ({
    sequence: item.sequence,
    title: item.title,
    durationMinutes: item.durationMinutes,
    notes: item.notes,
  }));

  const segmentCount = isEditingRunSheet
    ? segments.length
    : current.segmentCount;
  const totalDurationMinutes = isEditingRunSheet
    ? segments.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0)
    : current.totalDurationMinutes;

  return (
    <div className="flex flex-col gap-6 print:gap-0">
      <ProductionOverviewPanel
        values={details}
        endTime={current.endTime}
        onChange={handleDetailsChange}
        segmentCount={segmentCount}
        totalDurationMinutes={totalDurationMinutes}
        isEditing={isEditingOverview}
        onEdit={() => setIsEditingOverview(true)}
        onCancelEdit={handleCancelOverviewEdit}
        onSave={handleSaveDetails}
        isSaving={isSaving}
        saveDisabled={!detailsDirty || !details.title.trim()}
      />

      <ErrorAlert
        message={error ?? ''}
        onDismiss={clearError}
        className="print:hidden"
      />

      <RunSheetView
        productionTitle={current.title}
        eventDate={details.eventDate || current.eventDate}
        startTime={details.startTime || current.startTime}
        segments={runSheetSegments}
        totalDurationMinutes={current.totalDurationMinutes}
        isEditing={isEditingRunSheet}
        draftItems={segments}
        onDraftChange={handleSegmentsChange}
        onEdit={() => setIsEditingRunSheet(true)}
        onCancel={handleCancelRunSheetEdit}
        onSave={handleSaveRunSheet}
        isSaving={isSaving}
        saveDisabled={
          !segmentsDirty ||
          segments.length === 0 ||
          !segments.every((s) => s.title.trim())
        }
      />

      <DangerZone
        description={`Permanently delete "${current.title}" and its run sheet. This action cannot be undone.`}
        actionLabel="Delete Production"
        onAction={() => setShowDelete(true)}
        disabled={isSaving}
      />

      <ConfirmDialog
        open={showDelete}
        title="Delete Production?"
        description={`This will permanently delete "${current.title}" and its run sheet.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

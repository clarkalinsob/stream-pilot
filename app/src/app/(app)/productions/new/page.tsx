'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ErrorAlert } from '@/components/shared/error-alert';
import { FormActions } from '@/components/shared/form-actions';
import { PageHeader } from '@/components/shared/page-header';
import { StepIndicator } from '@/components/shared/step-indicator';
import {
  ProductionDetailsFields,
  type ProductionDetailsValues,
} from '@/components/productions/production-details-fields';
import { RunSheetView } from '@/components/productions/run-sheet-view';
import {
  createEmptySegment,
  sumDurationMinutes,
  toApiPayload,
  type RunSheetSegmentDraft,
} from '@/lib/run-sheet';
import {
  getProductionDetailsErrors,
  getRunSheetSegmentErrors,
  getVisibleFieldErrors,
  getVisibleRecordErrors,
  isProductionDetailsValid,
  isRunSheetValid,
} from '@/lib/validation';
import { useProductionsStore } from '@/stores/productions-store';

const STEP_LABELS = ['Production Details', 'Run Sheet'];

export default function NewProductionPage() {
  const router = useRouter();
  const { createProduction, isSaving, error, clearError } =
    useProductionsStore();

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<ProductionDetailsValues>({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
  });
  const [segments, setSegments] = useState<RunSheetSegmentDraft[]>([
    createEmptySegment(),
  ]);
  const [detailsTouched, setDetailsTouched] = useState<
    Partial<Record<'title' | 'eventDate' | 'startTime', boolean>>
  >({});
  const [showDetailErrors, setShowDetailErrors] = useState(false);
  const [segmentTouched, setSegmentTouched] = useState<Record<string, boolean>>(
    {},
  );
  const [showSegmentErrors, setShowSegmentErrors] = useState(false);

  function validateDetails() {
    return isProductionDetailsValid(details, { requireSchedule: true });
  }

  function validateSegments() {
    return isRunSheetValid(segments);
  }

  const detailErrors = getVisibleFieldErrors(
    getProductionDetailsErrors(details, { requireSchedule: true }),
    detailsTouched,
    showDetailErrors,
  );
  const segmentErrors = getVisibleRecordErrors(
    getRunSheetSegmentErrors(segments),
    segmentTouched,
    showSegmentErrors,
  );

  function handleContinue() {
    setShowDetailErrors(true);
    if (validateDetails()) setStep(2);
  }

  async function handleCreate() {
    setShowSegmentErrors(true);
    if (!validateDetails() || !validateSegments()) return;
    try {
      const created = await createProduction({
        title: details.title.trim(),
        description: details.description.trim() || undefined,
        eventDate: details.eventDate,
        startTime: details.startTime,
        runSheetItems: toApiPayload(segments),
      });
      router.push(`/productions/${created.id}`);
    } catch {
      // error in store
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        title="New Production"
        description="Set up your show details and build the run sheet."
      />

      <StepIndicator
        currentStep={step}
        totalSteps={2}
        labels={STEP_LABELS}
      />

      <ErrorAlert message={error ?? ''} onDismiss={clearError} />

      {step === 1 ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Production details</CardTitle>
            <CardDescription>
              Name your show and set when it starts. You can add segments on
              the next step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductionDetailsFields
              values={details}
              onChange={setDetails}
              requireSchedule
              errors={detailErrors}
              onFieldBlur={(field) =>
                setDetailsTouched((prev) => ({ ...prev, [field]: true }))
              }
            />
            <FormActions
              onCancel={() => router.push('/productions')}
              onSubmit={handleContinue}
              submitLabel="Continue to Run Sheet"
              submitType="button"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <RunSheetView
            productionTitle={details.title}
            eventDate={details.eventDate}
            startTime={details.startTime}
            segments={[]}
            totalDurationMinutes={sumDurationMinutes(segments)}
            isEditing
            draftItems={segments}
            onDraftChange={setSegments}
            segmentErrors={segmentErrors}
            onSegmentTitleBlur={(clientId) =>
              setSegmentTouched((prev) => ({ ...prev, [clientId]: true }))
            }
          />
          <FormActions
            onBack={() => setStep(1)}
            onSubmit={handleCreate}
            submitLabel="Create Production"
            submitType="button"
            isLoading={isSaving}
          />
        </div>
      )}
    </div>
  );
}

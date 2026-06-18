'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSingleFlight } from '@/hooks/use-single-flight';
import { cn } from '@/lib/utils';

type FormActionsProps = {
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void | Promise<void>;
  submitLabel?: string;
  backLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
  submitType?: 'button' | 'submit';
  className?: string;
};

export function FormActions({
  onBack,
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  backLabel = 'Back',
  cancelLabel = 'Cancel',
  isLoading = false,
  submitDisabled = false,
  submitType = 'submit',
  className,
}: FormActionsProps) {
  const submitHandler = useCallback(async () => {
    if (onSubmit) await onSubmit();
  }, [onSubmit]);

  const { run: runSubmit, isPending } = useSingleFlight(submitHandler);
  const isBusy = isPending || isLoading;
  const hasLeadingAction = Boolean(onCancel || onBack);

  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:items-center',
        hasLeadingAction ? 'sm:justify-between' : 'sm:justify-end',
        className,
      )}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        {onCancel && (
          <Button type="button" variant="ghost" disabled={isBusy} onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        {onBack && (
          <Button type="button" variant="outline" disabled={isBusy} onClick={onBack}>
            {backLabel}
          </Button>
        )}
      </div>
      {onSubmit !== undefined && (
        <Button
          type={submitType}
          loading={isBusy}
          disabled={isBusy || submitDisabled}
          onClick={
            submitType === 'button' ? () => void runSubmit() : undefined
          }
        >
          {isBusy ? 'Saving…' : submitLabel}
        </Button>
      )}
    </div>
  );
}

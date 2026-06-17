import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FormActionsProps = {
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
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
          <Button type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            {backLabel}
          </Button>
        )}
      </div>
      {onSubmit !== undefined && (
        <Button
          type={submitType}
          disabled={isLoading || submitDisabled}
          onClick={submitType === 'button' ? onSubmit : undefined}
        >
          {isLoading ? 'Saving…' : submitLabel}
        </Button>
      )}
    </div>
  );
}

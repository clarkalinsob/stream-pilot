import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type ErrorAlertProps = {
  message: string;
  onDismiss?: () => void;
  className?: string;
};

export function ErrorAlert({ message, onDismiss, className }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{message}</span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-sm underline underline-offset-4"
          >
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

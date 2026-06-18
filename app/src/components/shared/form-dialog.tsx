'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSingleFlight } from '@/hooks/use-single-flight';
import { cn } from '@/lib/utils';

type FormDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void | Promise<void>;
  submitLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
  contentClassName?: string;
  children: React.ReactNode;
};

export function FormDialog({
  open,
  title,
  description,
  onOpenChange,
  onSubmit,
  submitLabel,
  cancelLabel = 'Cancel',
  isLoading = false,
  submitDisabled = false,
  contentClassName,
  children,
}: FormDialogProps) {
  const { run: runSubmit, isPending } = useSingleFlight(onSubmit);
  const isBusy = isPending || isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', contentClassName)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {children}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            loading={isBusy}
            disabled={isBusy || submitDisabled}
            onClick={() => void runSubmit()}
          >
            {isBusy ? 'Saving…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

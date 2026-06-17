import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  labels: string[];
  className?: string;
};

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  className,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className={cn(className)}>
      <ol className="flex items-center gap-2 sm:gap-4">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li
              key={label}
              className={cn(
                'flex min-w-0 items-center gap-2 sm:gap-4',
                index < totalSteps - 1 && 'flex-1',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    isCurrent &&
                      'bg-primary text-primary-foreground shadow-sm',
                    isComplete && 'bg-primary/15 text-primary',
                    !isCurrent &&
                      !isComplete &&
                      'bg-muted text-muted-foreground',
                  )}
                >
                  {isComplete ? <Check className="size-4" /> : stepNumber}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'truncate text-sm font-medium',
                      isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground">
                      Step {stepNumber} of {totalSteps}
                    </p>
                  )}
                </div>
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'hidden h-px flex-1 sm:block',
                    isComplete ? 'bg-primary/40' : 'bg-border',
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

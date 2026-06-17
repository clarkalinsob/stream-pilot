import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DangerZoneProps = {
  title?: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  className?: string;
};

export function DangerZone({
  title = 'Danger Zone',
  description,
  actionLabel,
  onAction,
  disabled = false,
  className,
}: DangerZoneProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-destructive/25 bg-destructive/5 p-6 print:hidden',
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-destructive">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="mt-4"
        disabled={disabled}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </section>
  );
}

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { INPUT_MAX_LENGTH } from '@/lib/validation';

type InputWithCharacterCountProps = Omit<
  React.ComponentProps<typeof Input>,
  'maxLength'
> & {
  maxLength?: number;
};

export function InputWithCharacterCount({
  value,
  maxLength = INPUT_MAX_LENGTH,
  className,
  ...props
}: InputWithCharacterCountProps) {
  const text = typeof value === 'string' ? value : String(value ?? '');
  const atLimit = text.length >= maxLength;

  return (
    <div className="relative">
      <Input
        {...props}
        value={value}
        maxLength={maxLength}
        className={cn('pr-12', className)}
      />
      <span
        className={cn(
          'pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] tabular-nums text-muted-foreground md:text-xs',
          atLimit && 'text-destructive',
        )}
        aria-live="polite"
      >
        {text.length}/{maxLength}
      </span>
    </div>
  );
}

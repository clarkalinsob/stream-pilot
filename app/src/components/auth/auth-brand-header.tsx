import { Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthBrandHeaderProps = {
  className?: string;
};

export function AuthBrandHeader({ className }: AuthBrandHeaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 text-center', className)}>
      <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Radio className="size-5" />
      </div>
      <div>
        <p className="text-lg font-semibold tracking-tight">Stream Pilot</p>
        <p className="text-sm text-muted-foreground">
          Production Planning Platform for Streams
        </p>
      </div>
    </div>
  );
}

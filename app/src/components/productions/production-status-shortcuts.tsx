'use client';

import { Button } from '@/components/ui/button';
import type { ProductionStatus } from '@/types/production';
import {
  getProductionStatusActionLabel,
  PRODUCTION_STATUSES,
} from './status-badge';

type ProductionStatusShortcutsProps = {
  status: ProductionStatus;
  disabled?: boolean;
  onStatusChange: (status: ProductionStatus) => void;
};

export function ProductionStatusShortcuts({
  status,
  disabled = false,
  onStatusChange,
}: ProductionStatusShortcutsProps) {
  const targets = PRODUCTION_STATUSES.filter((s) => s !== status);

  return (
    <>
      {targets.map((target) => (
        <Button
          key={target}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onStatusChange(target)}
        >
          {getProductionStatusActionLabel(target)}
        </Button>
      ))}
    </>
  );
}

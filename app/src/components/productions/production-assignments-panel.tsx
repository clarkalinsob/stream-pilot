'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { crewRoleBadgeClasses } from '@/components/resources/crew-role-badge';
import { equipmentCategoryBadgeClasses } from '@/components/resources/equipment-category-badge';
import { formatCrewRole, formatEquipmentCategory } from '@/lib/resources';
import { cn } from '@/lib/utils';
import { AssignmentPickerDialog } from './assignment-picker-dialog';
import type {
  CrewAssignment,
  EquipmentAssignment,
  ReplaceAssignmentsData,
} from '@/types/production';

type ProductionAssignmentsPanelProps = {
  crewAssignments: CrewAssignment[];
  equipmentAssignments: EquipmentAssignment[];
  isSaving: boolean;
  onSave: (data: ReplaceAssignmentsData) => Promise<void>;
  className?: string;
};

function toPayload(
  crew: CrewAssignment[],
  equipment: EquipmentAssignment[],
): ReplaceAssignmentsData {
  return {
    crewMemberIds: crew.map((a) => a.crewMemberId),
    equipment: equipment.map((a) => ({
      equipmentId: a.equipmentId,
      quantity: a.quantity,
    })),
  };
}

type AssignmentTagProps = {
  label: string;
  meta?: string;
  onRemove: () => void;
  disabled?: boolean;
  variant?: 'crew' | 'equipment';
};

function AssignmentTag({
  label,
  meta,
  onRemove,
  disabled = false,
  variant = 'crew',
}: AssignmentTagProps) {
  const colorClasses =
    variant === 'crew' ? crewRoleBadgeClasses : equipmentCategoryBadgeClasses;
  const removeHoverClasses =
    variant === 'crew'
      ? 'hover:bg-violet-100 hover:text-violet-900 dark:hover:bg-violet-900/50 dark:hover:text-violet-100'
      : 'hover:bg-teal-100 hover:text-teal-900 dark:hover:bg-teal-900/50 dark:hover:text-teal-100';

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border py-0.5 pl-2.5 pr-1 text-xs',
        colorClasses,
      )}
    >
      <span className="truncate font-medium">{label}</span>
      {meta ? (
        <>
          <span className="shrink-0 opacity-50">·</span>
          <span className="shrink-0 opacity-80">{meta}</span>
        </>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className={cn(
          'ml-0.5 shrink-0 rounded-full p-0.5 opacity-70 transition-colors disabled:opacity-50',
          removeHoverClasses,
        )}
        aria-label={`Remove ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export function ProductionAssignmentsPanel({
  crewAssignments,
  equipmentAssignments,
  isSaving,
  onSave,
  className,
}: ProductionAssignmentsPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleRemoveCrew(crewMemberId: string) {
    await onSave(
      toPayload(
        crewAssignments.filter((a) => a.crewMemberId !== crewMemberId),
        equipmentAssignments,
      ),
    );
  }

  async function handleRemoveEquipment(equipmentId: string) {
    await onSave(
      toPayload(
        crewAssignments,
        equipmentAssignments.filter((a) => a.equipmentId !== equipmentId),
      ),
    );
  }

  return (
    <section
      className={cn(
        'rounded-xl border bg-card p-6 print:hidden',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Assignments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff and gear for this production. Pull from your{' '}
            <Link
              href="/resources"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Resources
            </Link>{' '}
            inventory.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isSaving}
          onClick={() => setPickerOpen(true)}
        >
          <UserPlus />
          Assign
        </Button>
      </div>

      <div className="mt-6 space-y-5">
        <AssignmentGroup
          title="Crew"
          emptyLabel="No crew assigned."
          count={crewAssignments.length}
        >
          {crewAssignments.map((member) => (
            <AssignmentTag
              key={member.crewMemberId}
              label={member.name}
              meta={formatCrewRole(member.role)}
              variant="crew"
              disabled={isSaving}
              onRemove={() => handleRemoveCrew(member.crewMemberId)}
            />
          ))}
        </AssignmentGroup>

        <AssignmentGroup
          title="Equipment"
          emptyLabel="No equipment assigned."
          count={equipmentAssignments.length}
        >
          {equipmentAssignments.map((item) => (
            <AssignmentTag
              key={item.equipmentId}
              label={`${item.name} × ${item.quantity}`}
              meta={formatEquipmentCategory(item.category)}
              variant="equipment"
              disabled={isSaving}
              onRemove={() => handleRemoveEquipment(item.equipmentId)}
            />
          ))}
        </AssignmentGroup>
      </div>

      <AssignmentPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initialCrewIds={crewAssignments.map((a) => a.crewMemberId)}
        initialEquipment={equipmentAssignments.map((a) => ({
          equipmentId: a.equipmentId,
          quantity: a.quantity,
        }))}
        isSaving={isSaving}
        onSave={onSave}
      />
    </section>
  );
}

function AssignmentGroup({
  title,
  emptyLabel,
  count,
  children,
}: {
  title: string;
  emptyLabel: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">
        {title} ({count})
      </h3>
      {count === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">{children}</div>
      )}
    </div>
  );
}

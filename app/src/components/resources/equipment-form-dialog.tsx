'use client';

import { useEffect, useState } from 'react';
import { FormDialog } from '@/components/shared/form-dialog';
import {
  EquipmentFormFields,
  emptyEquipmentFormValues,
  type EquipmentFormValues,
} from './equipment-form-fields';

type EquipmentFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: EquipmentFormValues;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: EquipmentFormValues) => Promise<void>;
};

export function EquipmentFormDialog({
  open,
  mode,
  initialValues,
  isSaving,
  onOpenChange,
  onSave,
}: EquipmentFormDialogProps) {
  const [values, setValues] = useState<EquipmentFormValues>(
    emptyEquipmentFormValues(),
  );

  useEffect(() => {
    if (!open) return;
    setValues(initialValues ?? emptyEquipmentFormValues());
  }, [open, initialValues]);

  const quantity = Number.parseInt(values.quantity, 10);
  const saveDisabled =
    !values.name.trim() || Number.isNaN(quantity) || quantity < 1;
  const isEdit = mode === 'edit';

  async function handleSave() {
    try {
      await onSave(values);
      onOpenChange(false);
    } catch {
      // error surfaced via store
    }
  }

  return (
    <FormDialog
      open={open}
      title={isEdit ? 'Edit equipment' : 'Add Equipment'}
      description="Gear and inventory for your productions."
      onOpenChange={onOpenChange}
      onSubmit={handleSave}
      submitLabel={isEdit ? 'Save equipment' : 'Add Equipment'}
      isLoading={isSaving}
      submitDisabled={saveDisabled}
    >
      <EquipmentFormFields
        values={values}
        onChange={setValues}
        disabled={isSaving}
      />
    </FormDialog>
  );
}

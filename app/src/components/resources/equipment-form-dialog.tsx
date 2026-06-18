'use client';

import { useEffect, useState } from 'react';
import { FormDialog } from '@/components/shared/form-dialog';
import {
  getEquipmentFormErrors,
  getVisibleFieldErrors,
  isEquipmentFormValid,
} from '@/lib/validation';
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
  const [touched, setTouched] = useState<Partial<Record<'name', boolean>>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues ?? emptyEquipmentFormValues());
    setTouched({});
    setShowAllErrors(false);
  }, [open, initialValues]);

  const errors = getVisibleFieldErrors(
    getEquipmentFormErrors(values),
    touched,
    showAllErrors,
  );
  const isEdit = mode === 'edit';

  async function handleSave() {
    setShowAllErrors(true);
    if (!isEquipmentFormValid(values)) return;

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
      title={isEdit ? 'Edit Equipment' : 'Add Equipment'}
      description="Gear and inventory for your productions."
      onOpenChange={onOpenChange}
      onSubmit={handleSave}
      submitLabel={isEdit ? 'Save Equipment' : 'Add Equipment'}
      isLoading={isSaving}
    >
      <EquipmentFormFields
        values={values}
        onChange={setValues}
        disabled={isSaving}
        errors={errors}
        onFieldBlur={(field) =>
          setTouched((prev) => ({ ...prev, [field]: true }))
        }
      />
    </FormDialog>
  );
}

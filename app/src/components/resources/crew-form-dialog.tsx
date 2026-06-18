'use client';

import { useEffect, useState } from 'react';
import { FormDialog } from '@/components/shared/form-dialog';
import {
  getCrewFormErrors,
  getVisibleFieldErrors,
  isCrewFormValid,
} from '@/lib/validation';
import {
  CrewFormFields,
  emptyCrewFormValues,
  type CrewFormValues,
} from './crew-form-fields';

type CrewFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: CrewFormValues;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CrewFormValues) => Promise<void>;
};

export function CrewFormDialog({
  open,
  mode,
  initialValues,
  isSaving,
  onOpenChange,
  onSave,
}: CrewFormDialogProps) {
  const [values, setValues] = useState<CrewFormValues>(emptyCrewFormValues());
  const [touched, setTouched] = useState<
    Partial<Record<'name' | 'email' | 'phone', boolean>>
  >({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues ?? emptyCrewFormValues());
    setTouched({});
    setShowAllErrors(false);
  }, [open, initialValues]);

  const errors = getVisibleFieldErrors(
    getCrewFormErrors(values),
    touched,
    showAllErrors,
  );
  const isEdit = mode === 'edit';

  async function handleSave() {
    setShowAllErrors(true);
    if (!isCrewFormValid(values)) return;

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
      title={isEdit ? 'Edit Crew Member' : 'Add Crew Member'}
      description="People you work with on productions."
      onOpenChange={onOpenChange}
      onSubmit={handleSave}
      submitLabel={isEdit ? 'Save Crew Member' : 'Add Crew Member'}
      isLoading={isSaving}
    >
      <CrewFormFields
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

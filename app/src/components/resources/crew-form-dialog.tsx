'use client';

import { useEffect, useState } from 'react';
import { FormDialog } from '@/components/shared/form-dialog';
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

  useEffect(() => {
    if (!open) return;
    setValues(initialValues ?? emptyCrewFormValues());
  }, [open, initialValues]);

  const saveDisabled = !values.name.trim();
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
      title={isEdit ? 'Edit crew member' : 'Add Crew Member'}
      description="People you work with on productions."
      onOpenChange={onOpenChange}
      onSubmit={handleSave}
      submitLabel={isEdit ? 'Save crew member' : 'Add Crew Member'}
      isLoading={isSaving}
      submitDisabled={saveDisabled}
    >
      <CrewFormFields values={values} onChange={setValues} disabled={isSaving} />
    </FormDialog>
  );
}

'use client';

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InputWithCharacterCount } from '@/components/shared/character-count';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EQUIPMENT_CATEGORIES,
  formatEquipmentCategory,
} from '@/lib/resources';
import type { EquipmentCategory } from '@/types/equipment';

export type EquipmentFormValues = {
  name: string;
  category: EquipmentCategory;
  quantity: string;
  notes: string;
};

type EquipmentFormFieldsProps = {
  values: EquipmentFormValues;
  onChange: (values: EquipmentFormValues) => void;
  disabled?: boolean;
  errors?: Partial<Record<'name', string>>;
  onFieldBlur?: (field: 'name') => void;
};

export function EquipmentFormFields({
  values,
  onChange,
  disabled = false,
  errors,
  onFieldBlur,
}: EquipmentFormFieldsProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="equipment-name">Name</FieldLabel>
        <InputWithCharacterCount
          id="equipment-name"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          onBlur={() => onFieldBlur?.('name')}
          placeholder="Sony FX3"
          disabled={disabled}
        />
        {errors?.name ? <FieldError>{errors.name}</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel htmlFor="equipment-category">Category</FieldLabel>
        <Select
          value={values.category}
          onValueChange={(category: EquipmentCategory) =>
            onChange({ ...values, category })
          }
          disabled={disabled}
        >
          <SelectTrigger id="equipment-category" className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {formatEquipmentCategory(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="equipment-quantity">Quantity</FieldLabel>
        <Input
          id="equipment-quantity"
          type="number"
          min={1}
          value={values.quantity}
          onChange={(e) => onChange({ ...values, quantity: e.target.value })}
          disabled={disabled}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="equipment-notes">Notes</FieldLabel>
        <Textarea
          id="equipment-notes"
          value={values.notes}
          onChange={(e) => onChange({ ...values, notes: e.target.value })}
          placeholder="Optional notes"
          rows={3}
          disabled={disabled}
        />
      </Field>
    </FieldGroup>
  );
}

export function emptyEquipmentFormValues(): EquipmentFormValues {
  return { name: '', category: 'CAMERA', quantity: '1', notes: '' };
}

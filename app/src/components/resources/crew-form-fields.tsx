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
import { CREW_ROLES, formatCrewRole, isCrewRole } from '@/lib/resources';
import type { CrewRole } from '@/types/crew';

export type CrewFormValues = {
  name: string;
  role: CrewRole;
  email: string;
  phone: string;
  notes: string;
};

type CrewFormFieldsProps = {
  values: CrewFormValues;
  onChange: (values: CrewFormValues) => void;
  disabled?: boolean;
  errors?: Partial<Record<'name' | 'email' | 'phone', string>>;
  onFieldBlur?: (field: 'name' | 'email' | 'phone') => void;
};

export function CrewFormFields({
  values,
  onChange,
  disabled = false,
  errors,
  onFieldBlur,
}: CrewFormFieldsProps) {
  const roleValue = isCrewRole(values.role) ? values.role : 'CAMERAMAN';

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="crew-name">Name</FieldLabel>
        <InputWithCharacterCount
          id="crew-name"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          onBlur={() => onFieldBlur?.('name')}
          placeholder="John Doe"
          disabled={disabled}
        />
        {errors?.name ? <FieldError>{errors.name}</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel htmlFor="crew-role">Role</FieldLabel>
        <Select
          value={roleValue}
          onValueChange={(role) => {
            if (isCrewRole(role)) {
              onChange({ ...values, role });
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger id="crew-role" className="w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {CREW_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {formatCrewRole(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="crew-email">Email</FieldLabel>
        <InputWithCharacterCount
          id="crew-email"
          type="email"
          value={values.email}
          onChange={(e) => onChange({ ...values, email: e.target.value })}
          onBlur={() => onFieldBlur?.('email')}
          placeholder="john@example.com (optional)"
          disabled={disabled}
        />
        {errors?.email ? <FieldError>{errors.email}</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel htmlFor="crew-phone">Phone</FieldLabel>
        <InputWithCharacterCount
          id="crew-phone"
          type="tel"
          value={values.phone}
          onChange={(e) => onChange({ ...values, phone: e.target.value })}
          onBlur={() => onFieldBlur?.('phone')}
          placeholder="+639123456789 (optional)"
          disabled={disabled}
        />
        {errors?.phone ? <FieldError>{errors.phone}</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel htmlFor="crew-notes">Notes</FieldLabel>
        <Textarea
          id="crew-notes"
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

export function emptyCrewFormValues(): CrewFormValues {
  return { name: '', role: 'CAMERAMAN', email: '', phone: '', notes: '' };
}

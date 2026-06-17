'use client';

import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
};

export function CrewFormFields({
  values,
  onChange,
  disabled = false,
}: CrewFormFieldsProps) {
  const roleValue = isCrewRole(values.role) ? values.role : 'CAMERAMAN';

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="crew-name">Name</FieldLabel>
        <Input
          id="crew-name"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          placeholder="John Doe"
          required
          disabled={disabled}
        />
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
        <Input
          id="crew-email"
          type="email"
          value={values.email}
          onChange={(e) => onChange({ ...values, email: e.target.value })}
          placeholder="john@example.com (optional)"
          disabled={disabled}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="crew-phone">Phone</FieldLabel>
        <Input
          id="crew-phone"
          type="tel"
          value={values.phone}
          onChange={(e) => onChange({ ...values, phone: e.target.value })}
          placeholder="+639123456789 (optional)"
          disabled={disabled}
        />
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

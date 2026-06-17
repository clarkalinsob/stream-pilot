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
import type { ProductionStatus } from '@/types/production';

export type ProductionDetailsValues = {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  status?: ProductionStatus;
};

type ProductionDetailsFieldsProps = {
  values: ProductionDetailsValues;
  onChange: (values: ProductionDetailsValues) => void;
  showStatus?: boolean;
  requireSchedule?: boolean;
  disabled?: boolean;
  compact?: boolean;
};

export function ProductionDetailsFields({
  values,
  onChange,
  showStatus = false,
  requireSchedule = false,
  disabled = false,
  compact = false,
}: ProductionDetailsFieldsProps) {
  return (
    <FieldGroup className={compact ? 'gap-5' : undefined}>
      <Field>
        <FieldLabel htmlFor="production-title">Title</FieldLabel>
        <Input
          id="production-title"
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          placeholder="Friday Night Stream"
          required
          disabled={disabled}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="production-event-date">Event Date</FieldLabel>
          <Input
            id="production-event-date"
            type="date"
            value={values.eventDate}
            onChange={(e) =>
              onChange({ ...values, eventDate: e.target.value })
            }
            required={requireSchedule}
            disabled={disabled}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="production-start-time">Start Time</FieldLabel>
          <Input
            id="production-start-time"
            type="time"
            value={values.startTime}
            onChange={(e) =>
              onChange({ ...values, startTime: e.target.value })
            }
            required={requireSchedule}
            disabled={disabled}
          />
        </Field>
      </div>
      {showStatus && (
        <Field>
          <FieldLabel htmlFor="production-status">Status</FieldLabel>
          <Select
            value={values.status}
            onValueChange={(status: ProductionStatus) =>
              onChange({ ...values, status })
            }
            disabled={disabled}
          >
            <SelectTrigger id="production-status" className="w-full sm:w-48">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}
      <Field>
        <FieldLabel htmlFor="production-description">Description</FieldLabel>
        <Textarea
          id="production-description"
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
          placeholder="Optional notes about this production"
          rows={3}
          disabled={disabled}
        />
      </Field>
    </FieldGroup>
  );
}

import type { RunSheetSegmentDraft } from '@/lib/run-sheet';

export const INPUT_MAX_LENGTH = 50;

export function inputMaxLengthError(fieldLabel: string): string {
  return `${fieldLabel} must be ${INPUT_MAX_LENGTH} characters or fewer.`;
}

function maxLengthError(
  value: string,
  fieldLabel: string,
): string | undefined {
  if (value.length > INPUT_MAX_LENGTH) {
    return inputMaxLengthError(fieldLabel);
  }
  return undefined;
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type ProductionDetailsInput = {
  title: string;
  eventDate: string;
  startTime: string;
};

export type CrewFormInput = {
  name: string;
  email: string;
  phone: string;
};

export type EquipmentFormInput = {
  name: string;
  quantity: string;
};

export function getProductionDetailsErrors(
  values: ProductionDetailsInput,
  options?: { requireSchedule?: boolean },
): FieldErrors<'title' | 'eventDate' | 'startTime'> {
  const errors: FieldErrors<'title' | 'eventDate' | 'startTime'> = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  } else {
    const titleError = maxLengthError(values.title, 'Title');
    if (titleError) errors.title = titleError;
  }

  if (options?.requireSchedule) {
    if (!values.eventDate) {
      errors.eventDate = 'Event date is required.';
    }
    if (!values.startTime) {
      errors.startTime = 'Start time is required.';
    }
  }

  return errors;
}

export function isProductionDetailsValid(
  values: ProductionDetailsInput,
  options?: { requireSchedule?: boolean },
): boolean {
  return Object.keys(getProductionDetailsErrors(values, options)).length === 0;
}

export function getCrewFormErrors(
  values: CrewFormInput,
): FieldErrors<'name' | 'email' | 'phone'> {
  const errors: FieldErrors<'name' | 'email' | 'phone'> = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  } else {
    const nameError = maxLengthError(values.name, 'Name');
    if (nameError) errors.name = nameError;
  }

  if (values.email.trim()) {
    const emailError = maxLengthError(values.email, 'Email');
    if (emailError) errors.email = emailError;
  }

  if (values.phone.trim()) {
    const phoneError = maxLengthError(values.phone, 'Phone');
    if (phoneError) errors.phone = phoneError;
  }

  return errors;
}

export function isCrewFormValid(values: CrewFormInput): boolean {
  return Object.keys(getCrewFormErrors(values)).length === 0;
}

export function getEquipmentFormErrors(
  values: Pick<EquipmentFormInput, 'name'>,
): FieldErrors<'name'> {
  const errors: FieldErrors<'name'> = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  } else {
    const nameError = maxLengthError(values.name, 'Name');
    if (nameError) errors.name = nameError;
  }

  return errors;
}

export function isEquipmentFormValid(values: EquipmentFormInput): boolean {
  const quantity = Number.parseInt(values.quantity, 10);
  if (Number.isNaN(quantity) || quantity < 1) return false;
  return Object.keys(getEquipmentFormErrors(values)).length === 0;
}

export function getRunSheetSegmentErrors(
  segments: RunSheetSegmentDraft[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const segment of segments) {
    if (!segment.title.trim()) {
      errors[segment.clientId] = 'Title is required.';
    } else {
      const titleError = maxLengthError(segment.title, 'Title');
      if (titleError) errors[segment.clientId] = titleError;
    }
  }

  return errors;
}

export function isRunSheetValid(segments: RunSheetSegmentDraft[]): boolean {
  if (segments.length === 0) return false;
  return Object.keys(getRunSheetSegmentErrors(segments)).length === 0;
}

export function getVisibleFieldErrors<T extends string>(
  errors: FieldErrors<T>,
  touched: Partial<Record<T, boolean>>,
  showAll = false,
): FieldErrors<T> {
  if (showAll) return errors;

  const visible: FieldErrors<T> = {};
  for (const key of Object.keys(errors) as T[]) {
    if (touched[key]) {
      visible[key] = errors[key];
    }
  }
  return visible;
}

export function getVisibleRecordErrors(
  errors: Record<string, string>,
  touched: Record<string, boolean>,
  showAll = false,
): Record<string, string> {
  if (showAll) return errors;

  const visible: Record<string, string> = {};
  for (const [key, message] of Object.entries(errors)) {
    if (touched[key]) {
      visible[key] = message;
    }
  }
  return visible;
}

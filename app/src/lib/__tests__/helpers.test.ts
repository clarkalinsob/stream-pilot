import { describe, expect, it } from 'vitest';
import {
  buildEventStartDate,
  formatDuration,
  formatEventDate,
  formatSegmentDuration,
  formatTimeValue,
} from '@/lib/format';
import {
  formatCrewRole,
  formatEquipmentCategory,
  isCrewRole,
} from '@/lib/resources';
import {
  getCrewFormErrors,
  getEquipmentFormErrors,
  getProductionDetailsErrors,
  getRunSheetSegmentErrors,
  getVisibleFieldErrors,
  getVisibleRecordErrors,
  isCrewFormValid,
  isEquipmentFormValid,
  isProductionDetailsValid,
  isRunSheetValid,
} from '@/lib/validation';
import {
  computeSegmentStartTimes,
  createEmptySegment,
  fromApiItems,
  reorderById,
  sumDurationMinutes,
  toApiPayload,
} from '@/lib/run-sheet';

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45 mins');
    expect(formatDuration(1)).toBe('1 min');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(85)).toBe('1h 25m');
  });

  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('returns 0 mins for zero', () => {
    expect(formatDuration(0)).toBe('0 mins');
  });
});

describe('formatEventDate', () => {
  it('returns fallback for null', () => {
    expect(formatEventDate(null)).toBe('No date set');
  });

  it('formats calendar date string', () => {
    const formatted = formatEventDate('2026-06-20');
    expect(formatted).not.toMatch(/am|pm/i);
    expect(formatted).toContain('2026');
  });
});

describe('formatTimeValue', () => {
  it('returns dash for null', () => {
    expect(formatTimeValue(null)).toBe('—');
  });

  it('formats HH:mm strings', () => {
    expect(formatTimeValue('15:30')).toMatch(/pm$/);
  });
});

describe('formatSegmentDuration', () => {
  it('formats minutes only', () => {
    expect(formatSegmentDuration(60)).toBe('60 mins');
    expect(formatSegmentDuration(5)).toBe('5 mins');
    expect(formatSegmentDuration(90)).toBe('90 mins');
    expect(formatSegmentDuration(120)).toBe('120 mins');
  });

  it('returns dash when duration is missing', () => {
    expect(formatSegmentDuration(null)).toBe('—');
    expect(formatSegmentDuration(0)).toBe('—');
  });
});

describe('buildEventStartDate', () => {
  it('combines date and time without timezone drift', () => {
    const start = buildEventStartDate('2026-06-21', '15:30');
    expect(start?.getFullYear()).toBe(2026);
    expect(start?.getMonth()).toBe(5);
    expect(start?.getDate()).toBe(21);
    expect(start?.getHours()).toBe(15);
    expect(start?.getMinutes()).toBe(30);
  });
});

describe('computeSegmentStartTimes', () => {
  it('computes cumulative start times from schedule', () => {
    const times = computeSegmentStartTimes('2026-06-20', '08:00', [
      { durationMinutes: 60 },
      { durationMinutes: 5 },
      { durationMinutes: 90 },
    ]);

    expect(times).toHaveLength(3);
    expect(times[0]?.getHours()).toBe(8);
    expect(times[1]?.getTime()).toBe(times[0]!.getTime() + 60 * 60_000);
    expect(times[2]?.getTime()).toBe(times[1]!.getTime() + 5 * 60_000);
  });

  it('returns null times when schedule is missing', () => {
    expect(
      computeSegmentStartTimes(null, '08:00', [{ durationMinutes: 10 }]),
    ).toEqual([null]);
  });
});

describe('run-sheet helpers', () => {
  it('creates empty segment with clientId', () => {
    const segment = createEmptySegment();
    expect(segment.clientId).toBeTruthy();
    expect(segment.title).toBe('');
  });

  it('reorders items by id', () => {
    const items = [
      { clientId: 'a', title: 'A' },
      { clientId: 'b', title: 'B' },
      { clientId: 'c', title: 'C' },
    ];
    const result = reorderById(items, 'c', 'a');
    expect(result.map((item) => item.title)).toEqual(['C', 'A', 'B']);
  });

  it('returns same list when reorder ids are invalid', () => {
    const items = [{ clientId: 'a', title: 'A' }];
    expect(reorderById(items, 'a', 'missing')).toEqual(items);
  });

  it('converts to API payload', () => {
    const items = [
      { clientId: 'a', title: '  Intro  ', durationMinutes: 5, notes: '  hi ' },
    ];
    expect(toApiPayload(items)).toEqual([
      { title: 'Intro', durationMinutes: 5, notes: 'hi' },
    ]);
  });

  it('maps API items to drafts', () => {
    const items = fromApiItems([
      {
        id: 'id-1',
        sequence: 1,
        title: 'Intro',
        durationMinutes: 5,
        notes: null,
      },
    ]);
    expect(items[0].clientId).toBe('id-1');
    expect(items[0].title).toBe('Intro');
  });

  it('sums duration minutes', () => {
    expect(
      sumDurationMinutes([
        { durationMinutes: 5 },
        { durationMinutes: 10 },
        {},
      ]),
    ).toBe(15);
  });
});

describe('formatCrewRole', () => {
  it('formats crew roles for display', () => {
    expect(formatCrewRole('CAMERAMAN')).toBe('Cameraman');
    expect(formatCrewRole('AUDIOMAN')).toBe('Audioman');
    expect(formatCrewRole('MIC_MAN')).toBe('Mic Man');
    expect(formatCrewRole('VIDEO')).toBe('Video');
    expect(formatCrewRole('FLOOR')).toBe('Floor');
  });

  it('falls back for unknown roles', () => {
    expect(formatCrewRole('CUSTOM_ROLE')).toBe('CUSTOM ROLE');
  });
});

describe('isCrewRole', () => {
  it('returns true for known crew roles', () => {
    expect(isCrewRole('CAMERAMAN')).toBe(true);
    expect(isCrewRole('DIRECTOR')).toBe(true);
  });

  it('returns false for unknown values', () => {
    expect(isCrewRole('CUSTOM_ROLE')).toBe(false);
    expect(isCrewRole('')).toBe(false);
  });
});

describe('formatEquipmentCategory', () => {
  it('formats equipment categories for display', () => {
    expect(formatEquipmentCategory('LAPTOP')).toBe('Laptop');
    expect(formatEquipmentCategory('ELECTRICAL')).toBe('Electrical');
  });
});

describe('validation', () => {
  it('rejects fields over 50 characters', () => {
    const longName = 'a'.repeat(51);
    expect(getCrewFormErrors({ name: longName, email: '', phone: '' }).name).toBe(
      'Name must be 50 characters or fewer.',
    );
    expect(
      getProductionDetailsErrors({
        title: longName,
        eventDate: '',
        startTime: '',
      }).title,
    ).toBe('Title must be 50 characters or fewer.');
  });

  it('allows descriptions and notes without length limits', () => {
    const longText = 'a'.repeat(200);
    expect(
      getProductionDetailsErrors({
        title: 'Show',
        eventDate: '2026-06-20',
        startTime: '10:00',
      }),
    ).toEqual({});
    expect(
      getRunSheetSegmentErrors([
        { clientId: 'a', title: 'Intro', notes: longText },
      ]),
    ).toEqual({});
  });

  it('validates run sheet segment titles', () => {
    expect(
      isRunSheetValid([{ clientId: 'a', title: '', notes: '' }]),
    ).toBe(false);
    expect(
      isRunSheetValid([{ clientId: 'a', title: 'Intro', notes: '' }]),
    ).toBe(true);
  });

  it('hides validation errors until a field is touched or submit is attempted', () => {
    const errors = getProductionDetailsErrors({
      title: '',
      eventDate: '',
      startTime: '',
    });

    expect(getVisibleFieldErrors(errors, {}, false)).toEqual({});
    expect(getVisibleFieldErrors(errors, { title: true }, false)).toEqual({
      title: 'Title is required.',
    });
    expect(getVisibleFieldErrors(errors, {}, true)).toEqual(errors);

    const segmentErrors = getRunSheetSegmentErrors([
      { clientId: 'a', title: '', notes: '' },
    ]);
    expect(getVisibleRecordErrors(segmentErrors, {}, false)).toEqual({});
    expect(getVisibleRecordErrors(segmentErrors, { a: true }, false)).toEqual({
      a: 'Title is required.',
    });
  });

  it('requires crew name', () => {
    expect(getCrewFormErrors({ name: '', email: '', phone: '' }).name).toBe(
      'Name is required.',
    );
    expect(isCrewFormValid({ name: 'Alex', email: '', phone: '' })).toBe(true);
  });

  it('validates equipment name and quantity', () => {
    expect(getEquipmentFormErrors({ name: '' }).name).toBe('Name is required.');
    expect(isEquipmentFormValid({ name: 'Camera', quantity: '0' })).toBe(false);
    expect(isEquipmentFormValid({ name: 'Camera', quantity: 'abc' })).toBe(
      false,
    );
    expect(isEquipmentFormValid({ name: 'Camera', quantity: '2' })).toBe(true);
  });

  it('requires schedule fields when requireSchedule is enabled', () => {
    const values = { title: 'Show', eventDate: '', startTime: '' };
    expect(isProductionDetailsValid(values, { requireSchedule: true })).toBe(
      false,
    );
    expect(
      getProductionDetailsErrors(values, { requireSchedule: true }),
    ).toEqual({
      eventDate: 'Event date is required.',
      startTime: 'Start time is required.',
    });
    expect(
      isProductionDetailsValid(
        { title: 'Show', eventDate: '2026-06-20', startTime: '10:00' },
        { requireSchedule: true },
      ),
    ).toBe(true);
  });

  it('rejects empty run sheet', () => {
    expect(isRunSheetValid([])).toBe(false);
  });
});

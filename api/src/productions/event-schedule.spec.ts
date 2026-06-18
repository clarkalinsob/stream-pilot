import {
  addMinutesToTime,
  computeEndTimeDate,
  formatTimeUntilEvent,
  isWithinHoursBeforeEvent,
  parseDateString,
  parseTimeString,
  sumDurationMinutes,
  toDateString,
  toTimeString,
} from './event-schedule';

describe('event-schedule', () => {
  describe('addMinutesToTime', () => {
    it('adds minutes within the same hour', () => {
      expect(addMinutesToTime('08:00', 30)).toBe('08:30');
    });

    it('rolls over to the next hour', () => {
      expect(addMinutesToTime('08:00', 90)).toBe('09:30');
    });

    it('wraps at midnight', () => {
      expect(addMinutesToTime('23:30', 60)).toBe('00:30');
    });
  });

  describe('sumDurationMinutes', () => {
    it('sums durations and treats null as zero', () => {
      expect(
        sumDurationMinutes([
          { durationMinutes: 10 },
          { durationMinutes: null },
          { durationMinutes: 5 },
        ]),
      ).toBe(15);
    });

    it('returns zero for empty list', () => {
      expect(sumDurationMinutes([])).toBe(0);
    });
  });

  describe('computeEndTimeDate', () => {
    it('returns end time from start and duration', () => {
      const end = computeEndTimeDate('08:00', 90);
      expect(end).not.toBeNull();
      expect(end!.getUTCHours()).toBe(9);
      expect(end!.getUTCMinutes()).toBe(30);
    });

    it('returns null when start time is missing', () => {
      expect(computeEndTimeDate(null, 60)).toBeNull();
      expect(computeEndTimeDate(undefined, 60)).toBeNull();
    });

    it('returns null when duration is zero or negative', () => {
      expect(computeEndTimeDate('08:00', 0)).toBeNull();
      expect(computeEndTimeDate('08:00', -5)).toBeNull();
    });
  });

  describe('toDateString', () => {
    it('formats date as YYYY-MM-DD', () => {
      expect(toDateString(new Date('2026-06-20T12:00:00.000Z'))).toBe('2026-06-20');
    });

    it('returns null for missing value', () => {
      expect(toDateString(null)).toBeNull();
      expect(toDateString(undefined)).toBeNull();
    });
  });

  describe('toTimeString', () => {
    it('formats time as HH:mm in UTC', () => {
      expect(toTimeString(parseTimeString('15:30'))).toBe('15:30');
    });

    it('returns null for missing value', () => {
      expect(toTimeString(null)).toBeNull();
    });
  });

  describe('parseDateString', () => {
    it('parses calendar date at UTC midnight', () => {
      const date = parseDateString('2026-06-20');
      expect(date.toISOString()).toBe('2026-06-20T00:00:00.000Z');
    });
  });

  describe('parseTimeString', () => {
    it('parses HH:mm into a time-only date', () => {
      const time = parseTimeString('08:45');
      expect(time.getUTCHours()).toBe(8);
      expect(time.getUTCMinutes()).toBe(45);
    });
  });

  describe('isWithinHoursBeforeEvent', () => {
    it('matches the reminder window before the event', () => {
      const eventDateTime = new Date('2026-06-19T08:00:00.000Z');
      const now = new Date('2026-06-18T08:00:30.000Z');

      expect(isWithinHoursBeforeEvent(eventDateTime, now, 24)).toBe(true);
      expect(isWithinHoursBeforeEvent(eventDateTime, now, 2)).toBe(false);
    });

    it('fires within one minute of the two-hour mark', () => {
      const eventDateTime = new Date('2026-06-19T01:12:00.000Z');
      const now = new Date('2026-06-18T23:12:00.000Z');

      expect(isWithinHoursBeforeEvent(eventDateTime, now, 2)).toBe(true);
    });
  });

  describe('formatTimeUntilEvent', () => {
    it('formats days, hours, and minutes', () => {
      const event = new Date('2026-06-20T08:00:00.000Z');

      expect(
        formatTimeUntilEvent(event, new Date('2026-06-18T08:00:00.000Z')),
      ).toBe('2 days');
      expect(
        formatTimeUntilEvent(event, new Date('2026-06-20T06:00:00.000Z')),
      ).toBe('2 hours');
      expect(
        formatTimeUntilEvent(event, new Date('2026-06-20T07:45:00.000Z')),
      ).toBe('15 minutes');
    });
  });
});

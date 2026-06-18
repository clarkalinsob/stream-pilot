import { describe, expect, it } from 'vitest';
import { singleFlight } from '../single-flight';

describe('singleFlight', () => {
  it('returns the same promise for concurrent calls', async () => {
    let callCount = 0;
    const fn = singleFlight(async () => {
      callCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'done';
    });

    const [first, second] = await Promise.all([fn(), fn()]);

    expect(callCount).toBe(1);
    expect(first).toBe('done');
    expect(second).toBe('done');
  });

  it('allows a new call after the previous promise settles', async () => {
    let callCount = 0;
    const fn = singleFlight(async () => {
      callCount += 1;
      return callCount;
    });

    expect(await fn()).toBe(1);
    expect(await fn()).toBe(2);
  });

  it('forwards arguments to the wrapped function', async () => {
    const fn = singleFlight(async (value: number) => value * 2);

    expect(await fn(21)).toBe(42);
  });
});

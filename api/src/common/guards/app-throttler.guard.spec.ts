import { AppThrottlerGuard } from './app-throttler.guard';

describe('AppThrottlerGuard', () => {
  const guard = Object.create(
    AppThrottlerGuard.prototype,
  ) as AppThrottlerGuard;

  function getTracker(req: Record<string, unknown>) {
    return guard['getTracker'](req as never);
  }

  it('tracks authenticated requests by user id', async () => {
    await expect(
      getTracker({ user: { id: 'user-123' }, ip: '127.0.0.1' }),
    ).resolves.toBe('user-123');
  });

  it('falls back to IP for unauthenticated requests', async () => {
    await expect(getTracker({ ip: '203.0.113.10' })).resolves.toBe(
      '203.0.113.10',
    );
  });

  it('uses unknown when IP is missing', async () => {
    await expect(getTracker({})).resolves.toBe('unknown');
  });

  it('ignores IP when user id is present', async () => {
    await expect(
      getTracker({ user: { id: 'user-abc' }, ip: '10.0.0.1' }),
    ).resolves.toBe('user-abc');
  });
});

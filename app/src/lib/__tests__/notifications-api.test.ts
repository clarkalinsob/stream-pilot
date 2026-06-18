import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchUnreadCount } from '@/lib/notifications-api';

describe('notifications-api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchUnreadCount returns count from API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ count: 2 }),
      }),
    );

    const result = await fetchUnreadCount();

    expect(result).toEqual({ count: 2 });
    expect(fetch).toHaveBeenCalledWith(
      '/api/notifications/unread-count',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from '@/lib/api';

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '1', title: 'Show' }),
      }),
    );

    const result = await apiFetch<{ id: string; title: string }>('/productions/1');

    expect(result).toEqual({ id: '1', title: 'Show' });
    expect(fetch).toHaveBeenCalledWith(
      '/api/productions/1',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('returns undefined for 204 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      }),
    );

    const result = await apiFetch<void>('/productions/1', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });

  it('throws ApiError with session message on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    await expect(apiFetch('/auth/me')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Session expired',
      status: 401,
    });
  });

  it('throws ApiError with string message from error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Title is required' }),
      }),
    );

    await expect(apiFetch('/productions', { method: 'POST' })).rejects.toEqual(
      new ApiError('Title is required', 400),
    );
  });

  it('throws ApiError with joined array message from error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({ message: ['Title is required', 'Date is required'] }),
      }),
    );

    await expect(apiFetch('/productions', { method: 'POST' })).rejects.toEqual(
      new ApiError('Title is required, Date is required', 422),
    );
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCurrentPushSubscription,
  subscribeToPush,
  isPushSupported,
} from '@/lib/push-notifications';

describe('push-notifications', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ publicKey: 'BKx-example-key' }),
    }));
  });

  it('reports unsupported when Notification API is missing', () => {
    expect(isPushSupported()).toBe(false);
  });

  it('subscribes and posts subscription to API when supported', async () => {
    const subscribe = vi.fn().mockResolvedValue({
      toJSON: () => ({
        endpoint: 'https://push.example/1',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      }),
    });
    const getSubscription = vi.fn().mockResolvedValue(null);

    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
    });

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        serviceWorker: {
          register: vi.fn().mockResolvedValue({
            pushManager: { subscribe, getSubscription },
          }),
          ready: Promise.resolve({
            pushManager: { subscribe, getSubscription },
          }),
          getRegistration: vi.fn(),
        },
      },
    });

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: globalThis,
    });

    const atobMock = vi.fn((value: string) => value);
    Object.defineProperty(globalThis, 'atob', {
      configurable: true,
      value: atobMock,
    });

    const subscription = await subscribeToPush();

    expect(subscription).not.toBeNull();
    expect(subscribe).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/subscribe'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns null when no service worker is registered', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        serviceWorker: {
          getRegistrations: vi.fn().mockResolvedValue([]),
        },
      },
    });

    await expect(getCurrentPushSubscription()).resolves.toBeNull();
  });

  it('returns null when permission is denied', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      configurable: true,
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('denied'),
      },
    });

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        serviceWorker: {
          register: vi.fn(),
          ready: Promise.resolve({}),
        },
      },
    });

    const subscription = await subscribeToPush();
    expect(subscription).toBeNull();
  });
});

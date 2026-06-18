'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCurrentPushSubscription,
  getPushSupportState,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push-notifications';

export type PushState = 'loading' | 'enabled' | 'disabled' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const [pushState, setPushState] = useState<PushState>('loading');
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPushState = useCallback(async () => {
    try {
      if (!isPushSupported()) {
        setPushState('unsupported');
        return;
      }

      if (getPushSupportState() === 'denied') {
        setPushState('denied');
        return;
      }

      const subscription = await getCurrentPushSubscription();
      setPushState(subscription ? 'enabled' : 'disabled');
    } catch {
      setPushState('disabled');
    }
  }, []);

  useEffect(() => {
    void refreshPushState();
  }, [refreshPushState]);

  const enablePush = useCallback(async () => {
    if (pushState === 'enabled' || pushState === 'unsupported' || pushState === 'denied') {
      return false;
    }

    setIsEnabling(true);
    setError(null);

    try {
      const subscription = await subscribeToPush();
      if (!subscription) {
        if (getPushSupportState() === 'denied') {
          setPushState('denied');
          setError('Browser notifications were blocked. Allow them in site settings and try again.');
        } else {
          setError('Could not enable push notifications.');
        }
        return false;
      }

      setPushState('enabled');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable push notifications');
      await refreshPushState();
      return false;
    } finally {
      setIsEnabling(false);
    }
  }, [pushState, refreshPushState]);

  const disablePush = useCallback(async () => {
    if (pushState !== 'enabled' || isDisabling) {
      return;
    }

    setIsDisabling(true);
    setError(null);

    try {
      await unsubscribeFromPush();
      setPushState('disabled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable push notifications');
      await refreshPushState();
    } finally {
      setIsDisabling(false);
    }
  }, [pushState, isDisabling, refreshPushState]);

  return {
    pushState,
    isEnabling,
    isDisabling,
    error,
    enablePush,
    disablePush,
    refreshPushState,
    setError,
  };
}

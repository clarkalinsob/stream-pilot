'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchUnreadCount } from '@/lib/notifications-api';
import { listenForPushMessages } from '@/lib/push-notifications';

const COUNT_CHANGED_EVENT = 'notification-count-changed';

export function requestNotificationCountRefresh() {
  window.dispatchEvent(new Event(COUNT_CHANGED_EVENT));
}

export function useNotificationCount() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const { count: nextCount } = await fetchUnreadCount();
      setCount(nextCount);
    } catch {
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();

    const onCountChanged = () => {
      void refetch();
    };

    const stopListening = listenForPushMessages(() => {
      void refetch();
    });

    window.addEventListener(COUNT_CHANGED_EVENT, onCountChanged);

    return () => {
      stopListening();
      window.removeEventListener(COUNT_CHANGED_EVENT, onCountChanged);
    };
  }, [refetch]);

  return { count, isLoading, refetch };
}

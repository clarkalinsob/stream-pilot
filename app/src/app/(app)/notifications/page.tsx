'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { ErrorAlert } from '@/components/shared/error-alert';
import { PageHeader } from '@/components/shared/page-header';
import { PaginatedFooter } from '@/components/shared/paginated-footer';
import { PushNotificationsSettings } from '@/components/notifications/push-notifications-settings';
import { Button } from '@/components/ui/button';
import { requestNotificationCountRefresh } from '@/hooks/use-notification-count';
import { usePagination } from '@/hooks/use-pagination';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notifications-api';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/types/notification';

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
      <NotificationsPageContent />
    </Suspense>
  );
}

function NotificationsPageContent() {
  const router = useRouter();
  const { page, setPage, limit } = usePagination();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchNotifications({ page, limit });
      setNotifications(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function handleMarkRead(notification: NotificationItem) {
    if (notification.read) {
      if (notification.productionId) {
        router.push(`/productions/${notification.productionId}`);
      }
      return;
    }

    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
      requestNotificationCountRefresh();
      if (notification.productionId) {
        router.push(`/productions/${notification.productionId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      requestNotificationCountRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  }

  const hasUnread = notifications.some((item) => !item.read);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Alerts when a production is scheduled, plus reminders 24 hours and 2 hours before a show starts."
      >
        {hasUnread ? (
          <Button variant="outline" onClick={() => void handleMarkAllRead()}>
            Mark All Read
          </Button>
        ) : null}
      </PageHeader>

      <ErrorAlert message={error ?? ''} onDismiss={() => setError(null)} />

      <PushNotificationsSettings />

      {isLoading ? (
        <div className="text-muted-foreground">Loading notifications…</div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <Bell className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              Schedule a production or enable push alerts above.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/productions">View productions</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="divide-y rounded-lg border">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => void handleMarkRead(notification)}
                  className={cn(
                    'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                    !notification.read && 'bg-muted/30',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.read ? (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {notification.body}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <PaginatedFooter
            meta={{ page, limit, total, totalPages }}
            onPageChange={setPage}
            itemLabel="notifications"
          />
        </>
      )}
    </div>
  );
}

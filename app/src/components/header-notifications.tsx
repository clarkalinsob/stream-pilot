'use client';

import { Bell, BellRing, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  requestNotificationCountRefresh,
  useNotificationCount,
} from '@/hooks/use-notification-count';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import {
  fetchNotifications,
  markNotificationRead,
} from '@/lib/notifications-api';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/types/notification';

function PushNotificationsDropdownActions({
  pushState,
  isEnabling,
  isDisabling,
  error,
  enablePush,
  disablePush,
}: ReturnType<typeof usePushNotifications>) {
  if (pushState === 'loading' || pushState === 'unsupported') {
    return null;
  }

  if (pushState === 'enabled') {
    return (
      <>
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 shrink-0 text-green-600 dark:text-green-500" />
          Push Notifications Enabled
        </div>
        <DropdownMenuItem
          className="text-xs text-muted-foreground"
          disabled={isDisabling}
          onSelect={(event) => {
            event.preventDefault();
            void disablePush();
          }}
        >
          {isDisabling ? 'Disabling…' : 'Disable Push Notifications'}
        </DropdownMenuItem>
      </>
    );
  }

  return (
    <>
      <DropdownMenuSeparator />
      {pushState === 'denied' ? (
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Push notifications are blocked in your browser settings.
        </div>
      ) : null}
      <DropdownMenuItem
        className="text-xs text-muted-foreground"
        disabled={pushState === 'denied' || isEnabling}
        onSelect={(event) => {
          event.preventDefault();
          void enablePush();
        }}
      >
        <BellRing className="size-3.5" />
        {isEnabling ? 'Enabling…' : 'Enable Push Notifications'}
      </DropdownMenuItem>
      {error ? (
        <div className="px-2 py-1.5 text-xs text-destructive">{error}</div>
      ) : null}
    </>
  );
}

export function HeaderNotifications() {
  const router = useRouter();
  const { count } = useNotificationCount();
  const pushNotifications = usePushNotifications();
  const { refreshPushState } = pushNotifications;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchNotifications({ page: 1, limit: 5 });
      setNotifications(response.data);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadRecent();
      void refreshPushState();
    }
  }, [open, loadRecent, refreshPushState]);

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );
        requestNotificationCountRefresh();
      } catch {
        // keep navigation even if mark-read fails
      }
    }

    setOpen(false);

    if (notification.productionId) {
      router.push(`/productions/${notification.productionId}`);
      return;
    }

    router.push('/notifications');
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {count > 0 ? (
            <span className="absolute right-1 top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-medium leading-none text-white">
              {count > 9 ? '9+' : count}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                'flex cursor-pointer flex-col items-start gap-0.5 py-2',
                !notification.read && 'bg-muted/40',
              )}
              onClick={() => void handleNotificationClick(notification)}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="line-clamp-1 min-w-0 flex-1 font-medium">
                  {notification.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <span className="line-clamp-2 text-xs text-muted-foreground">
                {notification.body}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <PushNotificationsDropdownActions {...pushNotifications} />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full justify-center font-medium">
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

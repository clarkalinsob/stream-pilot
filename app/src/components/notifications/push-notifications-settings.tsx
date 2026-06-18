'use client';

import { BellRing, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export function PushNotificationsSettings() {
  const {
    pushState,
    isEnabling,
    isDisabling,
    error,
    enablePush,
    disablePush,
  } = usePushNotifications();

  if (pushState === 'loading') {
    return (
      <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Checking push notification status…
      </div>
    );
  }

  if (pushState === 'unsupported') {
    return (
      <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Push notifications are not supported in this browser.
      </div>
    );
  }

  if (pushState === 'enabled') {
    return (
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-500" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Push Notifications Enabled</p>
            <p className="text-sm text-muted-foreground">
              You&apos;ll get a pop-up when a production is scheduled and before a show starts.
            </p>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </div>
        <Button
          className="shrink-0"
          variant="outline"
          disabled={isDisabling}
          onClick={() => void disablePush()}
        >
          {isDisabling ? 'Disabling…' : 'Disable Push Notifications'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <BellRing className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Browser push notifications</p>
          <p className="text-sm text-muted-foreground">
            {pushState === 'denied'
              ? 'Notifications are blocked for this site. Allow them in your browser site settings, then refresh.'
              : 'Turn on pop-up alerts when a production is scheduled or before a show starts.'}
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>
      <Button
        className="shrink-0"
        variant="outline"
        disabled={pushState === 'denied' || isEnabling}
        onClick={() => void enablePush()}
      >
        {isEnabling ? 'Enabling…' : 'Enable Push Notifications'}
      </Button>
    </div>
  );
}

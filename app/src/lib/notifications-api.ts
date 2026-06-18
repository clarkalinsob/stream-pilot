import { apiFetch } from '@/lib/api';
import type {
  NotificationItem,
  PaginatedNotificationsResponse,
} from '@/types/notification';

export function fetchNotifications(params?: {
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return apiFetch<PaginatedNotificationsResponse>(
    `/notifications${query ? `?${query}` : ''}`,
    { requireSession: true },
  );
}

export function fetchUnreadCount() {
  return apiFetch<{ count: number }>('/notifications/unread-count', {
    requireSession: true,
  });
}

export function markNotificationRead(id: string) {
  return apiFetch<NotificationItem>(`/notifications/${id}/read`, {
    method: 'PATCH',
    requireSession: true,
  });
}

export function markAllNotificationsRead() {
  return apiFetch<{ updated: number }>('/notifications/read-all', {
    method: 'PATCH',
    requireSession: true,
  });
}

export function fetchVapidPublicKey() {
  return apiFetch<{ publicKey: string }>('/notifications/vapid-public-key');
}

export function subscribePushSubscription(body: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  return apiFetch<{ ok: true }>('/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify(body),
    requireSession: true,
  });
}

export function unsubscribeAllPushSubscriptions() {
  return apiFetch<{ ok: true }>('/notifications/unsubscribe-all', {
    method: 'POST',
    requireSession: true,
  });
}

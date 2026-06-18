import { NotificationType } from '@prisma/client';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  productionId: string | null;
  createdAt: string;
};

export type PaginatedNotificationsResponse = {
  data: NotificationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type NotifyPayload = {
  type: NotificationType;
  title: string;
  body: string;
  productionId?: string;
  url?: string;
};

export type NotificationType =
  | 'PRODUCTION_SCHEDULED'
  | 'PRODUCTION_REMINDER_24H'
  | 'PRODUCTION_REMINDER_2H';

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

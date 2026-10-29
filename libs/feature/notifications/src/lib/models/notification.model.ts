export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  relatedOrderId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationQuery {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

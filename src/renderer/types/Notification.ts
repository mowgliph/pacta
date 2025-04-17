export interface Notification {
  id: number;
  userId: number;
  title?: string;
  message: string;
  type: string;
  subtype?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

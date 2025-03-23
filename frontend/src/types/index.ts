export type NotificationType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface NotificationOptions {
  duration?: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  category?: string;
  metadata?: Record<string, any>;
  read: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

export interface NotificationCount {
  count: number;
} 
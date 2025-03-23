export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
  label: string;
  route: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp?: string;
  persistent?: boolean;
  timeout?: number;
  group?: string;
  category?: string;
  action?: NotificationAction;
  read?: boolean;
}

export interface NotificationOptions {
  category?: string;
  metadata?: Record<string, unknown>;
  timeout?: number;
  persistent?: boolean;
  action?: NotificationAction;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface NotificationCount {
  count: number;
  categories?: Record<string, number>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  categoryUnreadCount: Record<string, number>;
}

export interface NotificationStore {
  add(notification: Notification): void;
  remove(id: string): void;
  clearGroup(group: string): void;
  clearAll(): void;
  markAsRead(id: string): void;
  markAllAsRead(): void;
} 
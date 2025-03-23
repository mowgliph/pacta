import type { Ref } from 'vue';
import type { 
  Notification, 
  NotificationType, 
  NotificationOptions, 
  NotificationResponse,
  NotificationCount 
} from '../types';

declare function useNotification(): {
  notifications: Ref<Notification[]>;
  unreadCount: Ref<number>;
  fetchNotifications: (options?: { page?: number; limit?: number; category?: string }) => Promise<NotificationResponse>;
  getUnreadCount: (category?: string) => Promise<number>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (category?: string) => Promise<void>;
  success: (message: string, options?: NotificationOptions) => Promise<void>;
  error: (message: string, options?: NotificationOptions) => Promise<void>;
  warning: (message: string, options?: NotificationOptions) => Promise<void>;
  info: (message: string, options?: NotificationOptions) => Promise<void>;
};

export default useNotification; 
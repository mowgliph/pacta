import { ref } from 'vue';
import type { 
  Notification, 
  NotificationType, 
  NotificationOptions, 
  NotificationResponse,
  NotificationCount 
} from '@/types';

export default function useNotification() {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);

  async function fetchNotifications(options: { page?: number; limit?: number; category?: string } = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: options.page?.toString() || '1',
        limit: options.limit?.toString() || '10',
        ...(options.category && { category: options.category })
      });

      const response = await fetch(`/api/v1/notifications?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json() as NotificationResponse;
      notifications.value = data.notifications;
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async function getUnreadCount(category?: string) {
    try {
      const queryParams = new URLSearchParams(
        category ? { category } : {}
      );
      const response = await fetch(`/api/v1/notifications/unread?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch unread count');
      
      const data = await response.json() as NotificationCount;
      unreadCount.value = data.count;
      return data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      const updatedNotification = await response.json() as Notification;
      const index = notifications.value.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications.value[index] = updatedNotification;
      }
      await getUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async function markAllAsRead(category?: string) {
    try {
      const queryParams = new URLSearchParams(
        category ? { category } : {}
      );
      const response = await fetch(`/api/v1/notifications/read-all?${queryParams}`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      
      await fetchNotifications();
      await getUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async function success(message: string, options: NotificationOptions = {}) {
    await createNotification('SUCCESS', message, options);
  }

  async function error(message: string, options: NotificationOptions = {}) {
    await createNotification('ERROR', message, options);
  }

  async function warning(message: string, options: NotificationOptions = {}) {
    await createNotification('WARNING', message, options);
  }

  async function info(message: string, options: NotificationOptions = {}) {
    await createNotification('INFO', message, options);
  }

  async function createNotification(
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ) {
    try {
      const response = await fetch('/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          message,
          category: options.category,
          metadata: options.metadata
        })
      });

      if (!response.ok) throw new Error('Failed to create notification');
      
      const notification = await response.json() as Notification;
      notifications.value.unshift(notification);
      await getUnreadCount();
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    success,
    error,
    warning,
    info
  };
} 
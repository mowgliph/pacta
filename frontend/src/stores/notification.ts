import { defineStore } from 'pinia';
import axios from 'axios';

interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  contractId?: number;
  userId: number;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    loading: false
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
    sortedNotifications: (state) => [...state.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  actions: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const response = await axios.get('/api/notifications');
        this.notifications = response.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id: number) {
      try {
        await axios.post(`/api/notifications/${id}/read`);
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },

    addNotification(notification: Notification) {
      this.notifications.unshift(notification);
    }
  }
});
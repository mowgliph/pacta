import { defineStore } from 'pinia';
import { notificationService, type Notification } from '../services/notification.service';
import { useToastNotificationStore } from './toastNotification';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    loading: false,
    unreadCount: 0
  }),

  getters: {
    sortedNotifications: (state) => [...state.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    hasUnread: (state) => state.unreadCount > 0
  },

  actions: {
    async fetchNotifications() {
      this.loading = true;
      try {
        this.notifications = await notificationService.getNotifications();
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        const toastStore = useToastNotificationStore();
        toastStore.error('Error al cargar notificaciones');
      } finally {
        this.loading = false;
      }
    },

    async fetchUnreadCount() {
      try {
        this.unreadCount = await notificationService.getUnreadCount();
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    },

    async markAsRead(id: number) {
      try {
        await notificationService.markAsRead(id);
        
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
          this.updateUnreadCount();
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
        const toastStore = useToastNotificationStore();
        toastStore.error('Error al marcar notificación como leída');
      }
    },

    async markAllAsRead() {
      try {
        await notificationService.markAllAsRead();
        
        this.notifications = this.notifications.map(notification => ({
          ...notification,
          read: true
        }));
        
        this.unreadCount = 0;
        
        const toastStore = useToastNotificationStore();
        toastStore.success('Todas las notificaciones marcadas como leídas');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        const toastStore = useToastNotificationStore();
        toastStore.error('Error al marcar todas las notificaciones como leídas');
      }
    },

    async deleteNotification(id: number) {
      try {
        await notificationService.deleteNotification(id);
        
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateUnreadCount();
        
        const toastStore = useToastNotificationStore();
        toastStore.success('Notificación eliminada');
      } catch (error) {
        console.error('Error deleting notification:', error);
        const toastStore = useToastNotificationStore();
        toastStore.error('Error al eliminar notificación');
      }
    },

    // Actualiza el contador de no leídas basado en las notificaciones actuales
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    },

    // Agrega una nueva notificación (para uso en tiempo real si se implementa)
    addNotification(notification: Notification) {
      this.notifications.unshift(notification);
      if (!notification.read) {
        this.unreadCount++;
      }
    }
  }
});
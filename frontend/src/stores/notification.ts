import { defineStore } from 'pinia';
import type { Notification, NotificationState } from '@/types/notification';

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    categoryUnreadCount: {}
  }),

  getters: {
    sortedNotifications: (state) => {
      return [...state.notifications].sort((a, b) => {
        // Primero las notificaciones persistentes
        if (a.persistent && !b.persistent) return -1;
        if (!a.persistent && b.persistent) return 1;
        
        // Luego por timestamp (más recientes primero)
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
      });
    },

    notificationsByCategory: (state) => {
      return state.notifications.reduce((acc, notification) => {
        const category = notification.category || 'uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(notification);
        return acc;
      }, {} as Record<string, Notification[]>);
    },

    unreadCountByCategory: (state) => {
      return state.categoryUnreadCount;
    }
  },

  actions: {
    add(notification: Notification) {
      // Agregar timestamp si no existe
      const newNotification = {
        ...notification,
        timestamp: notification.timestamp || new Date().toISOString()
      };

      // Si ya existe una notificación con el mismo ID, actualizarla
      const existingIndex = this.notifications.findIndex(n => n.id === notification.id);
      if (existingIndex !== -1) {
        this.notifications[existingIndex] = newNotification;
      } else {
        this.notifications.push(newNotification);
        this.unreadCount++;
        
        // Actualizar contador por categoría
        if (notification.category) {
          this.categoryUnreadCount[notification.category] = 
            (this.categoryUnreadCount[notification.category] || 0) + 1;
        }
      }

      // Configurar timeout para notificaciones no persistentes
      if (!notification.persistent && notification.timeout) {
        setTimeout(() => {
          this.remove(notification.id);
        }, notification.timeout);
      }

      // Agrupar notificaciones similares
      if (notification.group) {
        const similarNotifications = this.notifications.filter(
          n => n.group === notification.group && n.id !== notification.id
        );
        if (similarNotifications.length > 2) {
          // Mantener solo las 2 más recientes del mismo grupo
          similarNotifications
            .slice(2)
            .forEach(n => this.remove(n.id));
        }
      }
    },

    remove(id: string) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        const notification = this.notifications[index];
        if (!notification.persistent) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          
          // Actualizar contador por categoría
          if (notification.category) {
            this.categoryUnreadCount[notification.category] = Math.max(
              0,
              (this.categoryUnreadCount[notification.category] || 0) - 1
            );
          }
        }
        this.notifications.splice(index, 1);
      }
    },

    clearCategory(category: string) {
      const notificationsToRemove = this.notifications.filter(n => n.category === category);
      notificationsToRemove.forEach(n => this.remove(n.id));
      this.categoryUnreadCount[category] = 0;
    },

    clearGroup(group: string) {
      const notificationsToRemove = this.notifications.filter(n => n.group === group);
      notificationsToRemove.forEach(n => this.remove(n.id));
    },

    clearAll() {
      this.notifications = [];
      this.unreadCount = 0;
      this.categoryUnreadCount = {};
    },

    markAsRead(id: string) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification && !notification.persistent) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        
        // Actualizar contador por categoría
        if (notification.category) {
          this.categoryUnreadCount[notification.category] = Math.max(
            0,
            (this.categoryUnreadCount[notification.category] || 0) - 1
          );
        }
      }
    },

    markAllAsRead(category?: string) {
      if (category) {
        const notifications = this.notifications.filter(
          n => n.category === category && !n.persistent
        );
        notifications.forEach(n => this.markAsRead(n.id));
        this.categoryUnreadCount[category] = 0;
      } else {
        const nonPersistentCount = this.notifications.filter(n => !n.persistent).length;
        this.unreadCount = Math.max(0, this.unreadCount - nonPersistentCount);
        this.categoryUnreadCount = {};
      }
    },

    updateUnreadCount(count: number, categoryCount?: Record<string, number>) {
      this.unreadCount = count;
      if (categoryCount) {
        this.categoryUnreadCount = { ...categoryCount };
      }
    }
  }
});
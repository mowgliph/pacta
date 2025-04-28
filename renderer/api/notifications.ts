import { z } from 'zod';

// Definir canales IPC para comunicación con el proceso principal
export const NotificationsChannels = {
  GET_USER_NOTIFICATIONS: "notifications:getUserNotifications",
  GET_UNREAD_COUNT: "notifications:getUnreadCount",
  CREATE: "notifications:create",
  MARK_READ: "notifications:markRead",
  MARK_ALL_READ: "notifications:markAllRead",
  DELETE: "notifications:delete",
};

// Esquemas para validación en el lado del cliente
export const notificationSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  message: z.string().min(1, "El mensaje es requerido"),
  type: z.string().default("info"),
  subtype: z.string().optional(),
  userId: z.string().uuid(),
  data: z.record(z.any()).optional(),
  createdById: z.string().uuid().optional(),
});

// Servicios de API para notificaciones
export const notificationsApi = {
  /**
   * Obtener notificaciones de un usuario
   */
  getUserNotifications: async (filters = {}) => {
    return window.Electron.ipcRenderer.invoke(NotificationsChannels.GET_USER_NOTIFICATIONS, filters);
  },

  /**
   * Obtener conteo de notificaciones no leídas
   */
  getUnreadCount: async (userId) => {
    return window.Electron.ipcRenderer.invoke(NotificationsChannels.GET_UNREAD_COUNT, { userId });
  },

  /**
   * Crear una nueva notificación
   */
  createNotification: async (notificationData) => {
    // Validar datos antes de enviar
    const validData = notificationSchema.parse(notificationData);
    return window.Electron.ipcRenderer.invoke(NotificationsChannels.CREATE, validData);
  },

  /**
   * Marcar una notificación como leída
   */
  markAsRead: async (notificationId, userId) => {
    return window.Electron.ipcRenderer.invoke(NotificationsChannels.MARK_READ, {
      notificationId,
      userId
    });
  },

  /**
   * Marcar todas las notificaciones como leídas para un usuario
   */
  markAllAsRead: async (userId) => {
    return window.Electron.ipcRenderer.invoke(NotificationsChannels.MARK_ALL_READ, { userId });
  },

  /**
   * Eliminar una notificación
   */
  deleteNotification: async (notificationId, userId) => {
    return window.Electron.ipcRenderer.invoke(NotificationsChannels.DELETE, {
      notificationId,
      userId
    });
  }
}; 
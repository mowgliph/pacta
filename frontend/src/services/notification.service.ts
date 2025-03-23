import api from './api';

export interface Notification {
  id: number;
  userId: number;
  contractId?: number;
  type: 'EXPIRING_SOON' | 'EXPIRED';
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  Contract?: {
    id: number;
    title: string;
    contractNumber: string;
    status: string;
  };
}

class NotificationService {
  /**
   * Obtiene todas las notificaciones del usuario actual
   */
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data;
  }

  /**
   * Obtiene el número de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }

  /**
   * Marca una notificación como leída
   * @param id ID de la notificación
   */
  async markAsRead(id: number): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  }

  /**
   * Elimina una notificación
   * @param id ID de la notificación
   */
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }
}

export const notificationService = new NotificationService(); 
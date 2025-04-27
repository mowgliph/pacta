/**
 * Canales IPC relacionados con notificaciones
 */
import { 
  CreateNotificationRequest,
  MarkNotificationReadRequest,
  NotificationsListResponse
} from '../../shared/types';

/**
 * Enumera los canales IPC para notificaciones
 */
export enum NotificationsChannels {
  SHOW = "notifications:show",
  GET_ALL = "notifications:getAll",
  CREATE = "notifications:create",
  MARK_READ = "notifications:markRead",
  MARK_ALL_READ = "notifications:markAllRead",
  DELETE = "notifications:delete",
  GET_UNREAD_COUNT = "notifications:getUnreadCount",
  GET_BY_USER = "notifications:getByUser",
}

/**
 * Interfaz para solicitudes relacionadas con notificaciones
 */
export interface NotificationsRequests {
  [NotificationsChannels.GET_ALL]: {
    request: { filters?: any };
    response: NotificationsListResponse;
  };
  [NotificationsChannels.GET_BY_USER]: {
    request: { userId: string, filters?: any };
    response: { notifications: any[], total: number, page: number, limit: number };
  };
  [NotificationsChannels.CREATE]: {
    request: CreateNotificationRequest;
    response: { success: boolean; notification: any; message?: string };
  };
  [NotificationsChannels.MARK_READ]: {
    request: MarkNotificationReadRequest;
    response: { success: boolean; message?: string };
  };
  [NotificationsChannels.MARK_ALL_READ]: {
    request: { userId: string };
    response: { success: boolean; count: number; message?: string };
  };
  [NotificationsChannels.DELETE]: {
    request: { id: string, userId: string };
    response: { success: boolean; message?: string };
  };
  [NotificationsChannels.GET_UNREAD_COUNT]: {
    request: { userId: string };
    response: { count: number };
  };
  [NotificationsChannels.SHOW]: {
    request: { title: string; message: string; type?: string };
    response: { success: boolean };
  };
} 
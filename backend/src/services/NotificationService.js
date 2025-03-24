/**
 * Servicio de notificaciones para la aplicación PACTA
 * Gestiona la creación, consulta y actualización de notificaciones
 */
import { BaseService } from './BaseService.js';
import { NotificationRepository } from '../database/repositories/NotificationRepository.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { LoggingService } from './LoggingService.js';
import { CacheService } from './CacheService.js';

export class NotificationService extends BaseService {
  constructor() {
    super(new NotificationRepository());
    this.notificationRepository = this.repository;
    this.cacheService = new CacheService();
  }

  /**
   * Obtiene las notificaciones de un usuario
   * @param {String} userId - ID del usuario
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} - Notificaciones con metadata de paginación
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 10, isRead, type } = options;
      
      // Clave de cache
      const cacheKey = `notifications:user:${userId}:${JSON.stringify(options)}`;
      
      // Intentar obtener del cache
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      const filterOptions = { isRead, type };
      const result = await this.notificationRepository.findUserNotifications(userId, filterOptions, page, limit);
      
      // Guardar en cache por tiempo breve (30 segundos)
      // Las notificaciones cambian frecuentemente
      await this.cacheService.set(cacheKey, result, 30);
      
      return result;
    } catch (error) {
      LoggingService.error('Error getting user notifications', { userId, options, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   * @param {String} userId - ID del usuario
   * @returns {Promise<Number>} - Número de notificaciones no leídas
   */
  async getUnreadCount(userId) {
    try {
      const cacheKey = `notifications:unread:${userId}`;
      
      // Intentar obtener del cache
      const cached = await this.cacheService.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
      
      const options = { isRead: false };
      const result = await this.notificationRepository.findUserNotifications(userId, options, 1, 1);
      
      // Guardar en cache por tiempo breve (15 segundos)
      await this.cacheService.set(cacheKey, result.meta.total, 15);
      
      return result.meta.total;
    } catch (error) {
      LoggingService.error('Error getting unread notifications count', { userId, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Marca notificaciones como leídas
   * @param {String|Array} notificationIds - ID o array de IDs de notificaciones
   * @param {String} userId - ID del usuario propietario
   * @returns {Promise<Number>} - Número de notificaciones actualizadas
   */
  async markAsRead(notificationIds, userId) {
    try {
      const result = await this.notificationRepository.markAsRead(notificationIds, userId);
      
      // Invalidar caches relacionados
      await this.cacheService.invalidate(`notifications:unread:${userId}`);
      await this.cacheService.invalidatePattern(`notifications:user:${userId}:*`);
      
      LoggingService.info('Notifications marked as read', { notificationIds, userId, count: result });
      
      return result;
    } catch (error) {
      LoggingService.error('Error marking notifications as read', { notificationIds, userId, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param {String} userId - ID del usuario
   * @returns {Promise<Number>} - Número de notificaciones actualizadas
   */
  async markAllAsRead(userId) {
    try {
      const result = await this.notificationRepository.markAllAsRead(userId);
      
      // Invalidar caches relacionados
      await this.cacheService.invalidate(`notifications:unread:${userId}`);
      await this.cacheService.invalidatePattern(`notifications:user:${userId}:*`);
      
      LoggingService.info('All notifications marked as read', { userId, count: result });
      
      return result;
    } catch (error) {
      LoggingService.error('Error marking all notifications as read', { userId, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Crea una nueva notificación
   * @param {Object} data - Datos de la notificación
   * @returns {Promise<Object>} - Notificación creada
   */
  async createNotification(data) {
    try {
      this._validateNotificationData(data);
      
      const notification = await this.notificationRepository.create(data);
      
      // Invalidar caches relacionados
      await this.cacheService.invalidate(`notifications:unread:${data.userId}`);
      await this.cacheService.invalidatePattern(`notifications:user:${data.userId}:*`);
      
      LoggingService.info('Notification created', { notificationId: notification.id, userId: data.userId });
      
      return notification;
    } catch (error) {
      LoggingService.error('Error creating notification', { data, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Crea notificaciones para contratos próximos a vencer
   * @param {Number} daysThreshold - Días umbral para considerar vencimiento próximo
   * @returns {Promise<Number>} - Número de notificaciones creadas
   */
  async createExpirationNotifications(daysThreshold = 30) {
    try {
      const count = await this.notificationRepository.createExpirationNotifications(daysThreshold);
      
      LoggingService.info('Contract expiration notifications created', { count, daysThreshold });
      
      return count;
    } catch (error) {
      LoggingService.error('Error creating expiration notifications', { daysThreshold, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Valida los datos de una notificación
   * @param {Object} data - Datos a validar
   * @throws {ValidationError} - Si los datos son inválidos
   * @private
   */
  _validateNotificationData(data) {
    const requiredFields = ['userId', 'title', 'message', 'type'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validar que el tipo sea válido
    const validTypes = ['EXPIRATION_WARNING', 'RENEWAL_REMINDER', 'DOCUMENT_UPDATED', 'COMMENT_ADDED', 'ASSIGNMENT', 'SYSTEM'];
    if (!validTypes.includes(data.type)) {
      throw new ValidationError(`Invalid notification type: ${data.type}`);
    }
  }
} 
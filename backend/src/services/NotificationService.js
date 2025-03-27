/**
 * Servicio de notificaciones para la aplicación PACTA
 * Gestiona la creación, consulta y actualización de notificaciones
 */
import { prisma } from '../database/prisma.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { CacheService } from './CacheService.js';

class NotificationService {
  constructor() {
    this.cacheService = new CacheService('notifications');
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
      const skip = (page - 1) * limit;

      // Clave de cache
      const cacheKey = `notifications:user:${userId}:${JSON.stringify(options)}`;

      // Intentar obtener del cache
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Construir filtro para Prisma
      const where = {
        userId: parseInt(userId),
        ...(isRead !== undefined && { isRead: isRead === 'true' || isRead === true }),
        ...(type && { type }),
      };

      // Obtener total de registros para paginación
      const total = await prisma.notification.count({ where });

      // Obtener notificaciones
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const result = {
        data: notifications,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      // Guardar en cache por tiempo breve (30 segundos)
      // Las notificaciones cambian frecuentemente
      await this.cacheService.set(cacheKey, result, 30);

      return result;
    } catch (error) {
      logger.error('Error getting user notifications', {
        userId,
        options,
        error: error.message,
      });
      throw error;
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

      const total = await prisma.notification.count({
        where: {
          userId: parseInt(userId),
          isRead: false,
        },
      });

      // Guardar en cache por tiempo breve (15 segundos)
      await this.cacheService.set(cacheKey, total, 15);

      return total;
    } catch (error) {
      logger.error('Error getting unread notifications count', {
        userId,
        error: error.message,
      });
      throw error;
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
      // Asegurar que notificationIds sea un array
      const ids = Array.isArray(notificationIds)
        ? notificationIds.map(id => parseInt(id))
        : [parseInt(notificationIds)];

      // Actualizar notificaciones
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId: parseInt(userId),
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      // Invalidar caches relacionados
      await this.cacheService.invalidate(`notifications:unread:${userId}`);
      await this.cacheService.invalidatePattern(`notifications:user:${userId}:*`);

      logger.info('Notifications marked as read', {
        notificationIds,
        userId,
        count: result.count,
      });

      return result.count;
    } catch (error) {
      logger.error('Error marking notifications as read', {
        notificationIds,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param {String} userId - ID del usuario
   * @returns {Promise<Number>} - Número de notificaciones actualizadas
   */
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId: parseInt(userId),
          isRead: false,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      // Invalidar caches relacionados
      await this.cacheService.invalidate(`notifications:unread:${userId}`);
      await this.cacheService.invalidatePattern(`notifications:user:${userId}:*`);

      logger.info('All notifications marked as read', {
        userId,
        count: result.count,
      });

      return result.count;
    } catch (error) {
      logger.error('Error marking all notifications as read', {
        userId,
        error: error.message,
      });
      throw error;
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

      const notification = await prisma.notification.create({
        data: {
          ...data,
          userId: parseInt(data.userId),
          isRead: false,
        },
      });

      // Invalidar caches relacionados
      await this.cacheService.invalidate(`notifications:unread:${data.userId}`);
      await this.cacheService.invalidatePattern(`notifications:user:${data.userId}:*`);

      logger.info('Notification created', {
        notificationId: notification.id,
        userId: data.userId,
      });

      return notification;
    } catch (error) {
      logger.error('Error creating notification', { data, error: error.message });
      throw error;
    }
  }

  /**
   * Crea una notificación relacionada con una licencia
   * @param {Number} userId - ID del usuario
   * @param {String} severity - Severidad (INFO, WARNING, ERROR)
   * @param {String} message - Mensaje de la notificación
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} - Notificación creada
   */
  static async createLicenseNotification(userId, severity, message, metadata = {}) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: parseInt(userId),
          title: `License ${severity === 'ERROR' ? 'Alert' : 'Notification'}`,
          message,
          type: 'LICENSE',
          severity,
          isRead: false,
          metadata,
        },
      });

      logger.info('License notification created', {
        notificationId: notification.id,
        userId,
        severity,
      });

      return notification;
    } catch (error) {
      logger.error('Error creating license notification', {
        userId,
        severity,
        message,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Elimina notificaciones antiguas
   * @param {Number} days - Días de antigüedad para eliminar (default: 90)
   * @returns {Promise<Number>} - Número de notificaciones eliminadas
   */
  static async cleanupOldNotifications(days = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true,
        },
      });

      logger.info('Old notifications cleaned up', {
        days,
        count: result.count,
      });

      return result.count;
    } catch (error) {
      logger.error('Error cleaning up old notifications', {
        days,
        error: error.message,
      });
      throw error;
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
    const validTypes = [
      'EXPIRATION_WARNING',
      'RENEWAL_REMINDER',
      'DOCUMENT_UPDATED',
      'COMMENT_ADDED',
      'ASSIGNMENT',
      'SYSTEM',
      'LICENSE',
    ];
    if (!validTypes.includes(data.type)) {
      throw new ValidationError(`Invalid notification type: ${data.type}`);
    }
  }
}

export default NotificationService;

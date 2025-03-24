/**
 * Controlador para la gestión de notificaciones
 * Expone endpoints de la API para operaciones CRUD y consultas específicas de notificaciones
 */
import { BaseController } from './BaseController.js';
import { NotificationService } from '../../services/NotificationService.js';
import { ResponseService } from '../../services/ResponseService.js';

export class NotificationController extends BaseController {
  constructor() {
    const notificationService = new NotificationService();
    super(notificationService);
    this.notificationService = notificationService;
  }

  /**
   * Obtiene las notificaciones del usuario autenticado
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getUserNotifications = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, isRead, type } = req.query;

      // Opciones de filtrado
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };

      if (isRead !== undefined) {
        options.isRead = isRead === 'true';
      }

      if (type) {
        options.type = type;
      }

      const result = await this.notificationService.getUserNotifications(userId, options);

      res.status(200).json(ResponseService.paginate(result.data, result.pagination));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene el contador de notificaciones no leídas del usuario
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getUnreadCount = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const count = await this.notificationService.getUnreadCount(userId);

      res.status(200).json(ResponseService.success({ count }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marca una o varias notificaciones como leídas
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  markAsRead = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { ids } = req.body;

      if (!ids || (!Array.isArray(ids) && typeof ids !== 'string')) {
        return res
          .status(400)
          .json(ResponseService.error('Invalid notification IDs provided', 400));
      }

      const count = await this.notificationService.markAsRead(ids, userId);

      res.status(200).json(
        ResponseService.success({
          message: 'Notifications marked as read',
          count,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marca todas las notificaciones del usuario como leídas
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  markAllAsRead = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const count = await this.notificationService.markAllAsRead(userId);

      res.status(200).json(
        ResponseService.success({
          message: 'All notifications marked as read',
          count,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea una nueva notificación (solo para administradores o sistema)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  createNotification = async (req, res, next) => {
    try {
      // Solo administradores pueden crear notificaciones manualmente
      if (!req.user.isAdmin && !req.internal) {
        return res
          .status(403)
          .json(ResponseService.error('Unauthorized: Admin access required', 403));
      }

      const data = req.body;

      const notification = await this.notificationService.createNotification(data);

      res.status(201).json(ResponseService.created(notification));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea notificaciones para contratos próximos a vencer (solo admin o cron)
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  createExpirationNotifications = async (req, res, next) => {
    try {
      // Solo administradores o llamadas internas pueden ejecutar esto
      if (!req.user?.isAdmin && !req.internal) {
        return res
          .status(403)
          .json(ResponseService.error('Unauthorized: Admin access required', 403));
      }

      const { daysThreshold = 30 } = req.body;

      const count = await this.notificationService.createExpirationNotifications(
        parseInt(daysThreshold, 10),
      );

      res.status(200).json(
        ResponseService.success({
          message: 'Expiration notifications created',
          count,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export default new NotificationController();

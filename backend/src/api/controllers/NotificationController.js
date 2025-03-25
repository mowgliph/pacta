/**
 * Controlador para la gestión de notificaciones
 * Expone endpoints de la API para operaciones CRUD y consultas específicas de notificaciones
 */
import { BaseController } from './BaseController.js';
import { NotificationService } from '../../services/NotificationService.js';
import { ResponseService } from '../../services/ResponseService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { ValidationError } from '../../utils/errors.js';

export class NotificationController extends BaseController {
  constructor() {
    const notificationService = new NotificationService();
    super(notificationService);
    this.notificationService = notificationService;
    this.validationService = new ValidationService();
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
      
      // Validar parámetros de consulta
      const validatedQuery = await this.validationService.validateGetNotifications(req.query);

      const result = await this.notificationService.getUserNotifications(userId, validatedQuery);

      res.status(200).json(ResponseService.paginate(result.data, result.pagination));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('Parámetros de consulta inválidos', 400, error.details));
      }
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
      
      // Validar IDs de notificaciones
      const validatedData = await this.validationService.validateMarkAsRead(req.body);

      const count = await this.notificationService.markAsRead(validatedData.ids, userId);

      res.status(200).json(
        ResponseService.success({
          message: 'Notifications marked as read',
          count,
        }),
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('IDs de notificación inválidos', 400, error.details));
      }
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

      // Validar datos de notificación
      const validatedData = await this.validationService.validateNotificationCreation(req.body);

      const notification = await this.notificationService.createNotification(validatedData);

      res.status(201).json(ResponseService.created(notification));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('Datos de notificación inválidos', 400, error.details));
      }
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

      // Validar parámetros
      const validatedData = await this.validationService.validateExpirationNotifications(req.body);

      const count = await this.notificationService.createExpirationNotifications(
        validatedData.daysThreshold,
      );

      res.status(200).json(
        ResponseService.success({
          message: 'Expiration notifications created',
          count,
        }),
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('Parámetros inválidos', 400, error.details));
      }
      next(error);
    }
  };
}

export default new NotificationController();

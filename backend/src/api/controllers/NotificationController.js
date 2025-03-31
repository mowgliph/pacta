import { BaseController } from './BaseController.js';
import { NotificationService } from '../../services/NotificationService.js';
import { ValidationService } from '../../services/ValidationService.js';

export class NotificationController extends BaseController {
  constructor() {
    const notificationService = new NotificationService();
    super(notificationService);
    this.notificationService = notificationService;
    this.validationService = new ValidationService();
  }

  getUserNotifications = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const userId = req.user.id;
        const validatedQuery = await this.validationService.validateGetNotifications(req.query);
        return await this.notificationService.getUserNotifications(userId, validatedQuery);
      },
      { userId: req.user.id, query: req.query }
    );
  };

  markAsRead = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const userId = req.user.id;
        return await this.notificationService.markAsRead(id, userId);
      },
      { notificationId: req.params.id, userId: req.user.id }
    );
  };

  markAllAsRead = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const userId = req.user.id;
        return await this.notificationService.markAllAsRead(userId);
      },
      { userId: req.user.id }
    );
  };

  deleteNotification = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const userId = req.user.id;
        return await this.notificationService.deleteNotification(id, userId);
      },
      { notificationId: req.params.id, userId: req.user.id }
    );
  };
}

export default new NotificationController();

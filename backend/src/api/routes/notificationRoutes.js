import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ValidationService } from '../../services/ValidationService.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getUnreadCount,
} from '../controllers/notificationController.js';

const router = express.Router();
const validationService = new ValidationService();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener notificaciones del usuario (con paginación)
router.get(
  '/',
  validate(validationService.validators.notification.notificationQuerySchema, 'query'),
  getUserNotifications,
);

// Obtener el contador de notificaciones sin leer
router.get('/unread-count', getUnreadCount);

// Marcar una notificación como leída
router.patch(
  '/:id/read',
  validate(validationService.validators.notification.notificationIdSchema, 'params'),
  markAsRead,
);

// Marcar todas las notificaciones como leídas
router.patch('/mark-all-read', markAllAsRead);

// Archivar una notificación
router.patch(
  '/:id/archive',
  validate(validationService.validators.notification.notificationIdSchema, 'params'),
  archiveNotification,
);

export default router;

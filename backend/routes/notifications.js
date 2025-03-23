import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(authMiddleware);

// Obtener todas las notificaciones del usuario actual
router.get('/', getUserNotifications);

// Obtener conteo de notificaciones no leídas
router.get('/unread-count', getUnreadCount);

// Marcar una notificación como leída
router.post('/:id/read', markNotificationAsRead);

// Marcar todas las notificaciones como leídas
router.post('/mark-all-read', markAllNotificationsAsRead);

// Eliminar una notificación
router.delete('/:id', deleteNotification);

export default router; 
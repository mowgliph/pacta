import express from 'express';
import { validateJWT } from '../api/middleware/errorHandler.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getUnreadCount
} from '../api/controllers/notificationController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(validateJWT);

// Rutas
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:notificationId/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.patch('/:notificationId/archive', archiveNotification);

export default router; 
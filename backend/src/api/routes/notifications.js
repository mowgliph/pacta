import { Router } from 'express';
import NotificationController from '../api/controllers/NotificationController.js';
import { authenticate } from '../api/middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para obtener notificaciones
router.get('/', NotificationController.getNotifications);
router.get('/unread', NotificationController.getUnreadCount);

// Rutas para marcar notificaciones
router.put('/:id/read', NotificationController.markAsRead);
router.put('/read-all', NotificationController.markAllAsRead);

// Ruta para eliminar notificación
router.delete('/:id', NotificationController.deleteNotification);

// Ruta administrativa para limpieza
router.post('/cleanup', NotificationController.cleanupOldNotifications);

export default router; 
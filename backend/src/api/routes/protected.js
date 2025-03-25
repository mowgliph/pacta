/**
 * Rutas protegidas de la API (requieren autenticación)
 */
import express from 'express';
import { authorize } from '../middleware/authorizationMiddleware.js';
import UserController from '../controllers/UserController.js';
import ContractController from '../controllers/ContractController.js';
import NotificationController from '../controllers/NotificationController.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Instanciar controladores
const userController = new UserController();
const contractController = new ContractController();
const notificationController = new NotificationController();

// Rutas de perfil de usuario (cualquier usuario autenticado)
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/profile/password', userController.changePassword);

// Rutas de contratos (cualquier usuario autenticado)
router.get('/contracts', contractController.getAllContracts);
router.get('/contracts/:id', contractController.getContractById);
router.post('/contracts', apiLimiter, contractController.createContract);
router.put('/contracts/:id', apiLimiter, contractController.updateContract);
router.delete('/contracts/:id', apiLimiter, contractController.deleteContract);
router.get('/contracts/search', contractController.searchContracts);
router.get('/contracts/stats', contractController.getContractStats);

// Rutas de notificaciones (cualquier usuario autenticado)
router.get('/notifications', notificationController.getUserNotifications);
router.get('/notifications/unread', notificationController.getUnreadCount);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all', notificationController.markAllAsRead);

// Ruta para usuarios con roles específicos
router.get('/team-data', authorize(['MANAGER', 'ADMIN']), userController.getTeamData);

export default router;

import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import contractRoutes from './contracts.js';
import companyRoutes from './companies.js';
import notificationRoutes from './notifications.js';
import analyticsRoutes from './analytics.js';
import { validateJWT } from '../middlewares/authMiddleware.js';
import IndexController from '../controllers/IndexController.js';

const router = express.Router();
const indexController = IndexController;

// Rutas públicas
router.get('/', indexController.getApiInfo);
router.get('/health', indexController.healthCheck);

// Rutas protegidas - requieren autenticación
router.use('/auth', authRoutes);
router.use('/users', validateJWT, userRoutes);
router.use('/contracts', validateJWT, contractRoutes);
router.use('/companies', validateJWT, companyRoutes);
router.use('/notifications', validateJWT, notificationRoutes);
router.use('/analytics', validateJWT, analyticsRoutes);

// Ruta de estadísticas del sistema (solo admin)
router.get('/system-stats', validateJWT, indexController.getSystemStats);

export default router;

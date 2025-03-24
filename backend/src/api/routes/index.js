import express from 'express';
import authRoutes from './auth.js';
import contractRoutes from './contracts.js';
import userRoutes from './userRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import analyticsRoutes from './analytics.js';
import companyRoutes from './companyRoutes.js';
import { IndexController } from '../controllers/IndexController.js';
import { validateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();
const indexController = new IndexController();

// Rutas públicas
router.use('/auth', authRoutes);

// Información de la API y salud
router.get('/', indexController.getApiInfo);
router.get('/health', indexController.healthCheck);

// Rutas protegidas
router.use('/contracts', validateJWT, contractRoutes);
router.use('/users', validateJWT, userRoutes);
router.use('/notifications', validateJWT, notificationRoutes);
router.use('/analytics', validateJWT, analyticsRoutes);
router.use('/companies', validateJWT, companyRoutes);

// Estadísticas del sistema (protegido, solo admin)
router.get('/stats', validateJWT, indexController.getSystemStats);

export default router; 
/**
 * Router principal de la API
 */
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { notFoundHandler } from '../middleware/errorHandler.js';
import publicRoutes from './public.js';
import protectedRoutes from './protected.js';
import adminRoutes from './admin.js';
import backupRoutes from './backupRoutes.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

// Middleware para registrar todas las solicitudes
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Rutas públicas (no requieren autenticación)
router.use('/public', publicRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/protected', authenticate, protectedRoutes);

// Rutas de administración (requieren autenticación y rol de admin)
router.use('/admin', authenticate, adminRoutes);

// Rutas de backup (requieren autenticación)
router.use('/backup', authenticate, backupRoutes);

// Rutas de autenticación
router.use('/auth', publicRoutes);

// Manejo de rutas no encontradas
router.use(notFoundHandler);

export default router;

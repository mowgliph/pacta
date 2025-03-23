import express from 'express';
import authRoutes from './authRoutes.js';
import contractRoutes from './contractRoutes.js';
import userRoutes from './userRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import { validateJWT } from '../api/middleware/errorHandler.js';

const router = express.Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/contracts', validateJWT, contractRoutes);
router.use('/users', validateJWT, userRoutes);
router.use('/notifications', validateJWT, notificationRoutes);
router.use('/analytics', validateJWT, analyticsRoutes);

// Ruta de salud
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router; 
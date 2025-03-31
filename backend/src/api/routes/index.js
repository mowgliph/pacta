/**
 * Archivo principal para las rutas de la API
 * Combina todas las rutas y las exporta como un router único
 */
import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './admin.js';
import contractRoutes from './contracts.js';
import { authenticate } from '../middleware/auth.js';
import { NotFoundError } from '../../utils/errors.js';

const router = express.Router();

// Ruta de verificación de API
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'PACTA API v0.3.0',
    timestamp: new Date().toISOString(),
  });
});

// Rutas públicas (no requieren autenticación)
router.use('/auth', authRoutes);

// Middleware de autenticación para rutas protegidas
router.use(authenticate);

// Rutas protegidas (requieren autenticación)
router.use('/users', userRoutes);
router.use('/contracts', contractRoutes);

// Rutas de administración (requieren autenticación y role de admin)
router.use('/admin', adminRoutes);

// Manejador de rutas no encontradas dentro de la API
router.use('*', (req, res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.originalUrl}`));
});

export default router;

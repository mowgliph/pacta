import express from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './auth.js';
import contractRoutes from './contracts.js';
import documentRoutes from './documentRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import config from '../../config/app.config.js';

const router = express.Router();
const apiVersion = config.apiVersion || 'v1';

// Welcome route
router.get('/', (req, res) => {
  res.json({
    message: `Welcome to PACTA API ${apiVersion}`,
    version: apiVersion,
    documentation: `/api/${apiVersion}/docs`,
    status: 'online',
  });
});

// Register routes with version prefix
const registerRoutes = () => {
  // Rutas de autenticación
  router.use(`/${apiVersion}/auth`, authRoutes);

  // Rutas de usuarios
  router.use(`/${apiVersion}/users`, userRoutes);

  // Rutas de contratos
  router.use(`/${apiVersion}/contracts`, contractRoutes);

  // Rutas de documentos
  router.use(`/${apiVersion}/documents`, documentRoutes);

  // Rutas de notificaciones
  router.use(`/${apiVersion}/notifications`, notificationRoutes);

  return router;
};

export default registerRoutes();

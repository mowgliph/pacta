/**
 * Rutas públicas de la API (no requieren autenticación)
 */
import express from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();
const authController = new AuthController();

// Rutas de autenticación y registro
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/verify-email/:token', authController.verifyEmail);

// Información pública de la API
router.get('/info', (req, res) => {
  res.status(200).json({
    name: 'PACTA API',
    version: '1.0.0',
    description: 'API de gestión de contratos y licencias',
    docs: '/api/docs',
  });
});

export default router; 
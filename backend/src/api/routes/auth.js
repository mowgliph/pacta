import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, loginLimiter, validateLogin } from '../api/middleware/auth.js';
import * as authController from '../api/controllers/authController.js';

const router = express.Router();

// Login endpoint con rate limiting y validación
router.post('/login', loginLimiter, validateLogin, authController.login);

// Endpoint para solicitar restablecimiento de contraseña
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
], authController.forgotPassword);

// Verificar token de restablecimiento de contraseña
router.post('/verify-reset-token', authController.verifyResetToken);

// Establecer nueva contraseña
router.post('/reset-password', [
  body('token').notEmpty().withMessage('El token es requerido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage('La contraseña debe contener al menos una letra y un número')
], authController.resetPassword);

// Endpoint para activar licencia
router.post('/activate-license', authenticateToken, authController.activateLicense);

export default router;
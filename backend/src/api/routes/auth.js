import express from 'express';
import authController from '../controllers/AuthController.js';
import { authenticate, loginLimiter } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ValidationService } from '../../services/ValidationService.js';

const router = express.Router();
const validationService = new ValidationService();

// Login endpoint con rate limiting y validación
router.post(
  '/login',
  loginLimiter,
  validate(validationService.validators.auth.loginSchema),
  authController.login,
);

// Verificación de token
router.post(
  '/verify-token',
  validate(validationService.validators.auth.verifyTokenSchema),
  authController.verifyToken,
);

// Refrescar token
router.post(
  '/refresh-token',
  validate(validationService.validators.auth.refreshTokenSchema),
  authController.refreshToken,
);

export default router;

import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken, loginLimiter } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ValidationService } from '../../services/ValidationService.js';

const router = express.Router();
const authController = new AuthController();
const validationService = new ValidationService();

// Login endpoint con rate limiting y validación
router.post(
  '/login',
  loginLimiter,
  validate(validationService.validators.auth.loginSchema),
  authController.login.bind(authController),
);

// Verificación de token
router.post(
  '/verify-token',
  validate(validationService.validators.auth.verifyTokenSchema),
  authController.verifyToken.bind(authController),
);

// Refrescar token
router.post(
  '/refresh-token',
  validate(validationService.validators.auth.refreshTokenSchema),
  authController.refreshToken.bind(authController),
);

export default router;

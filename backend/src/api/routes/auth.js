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
  authController.login.bind(authController)
);

// Registro de usuario
router.post(
  '/register',
  validate(validationService.validators.auth.registrationSchema),
  authController.register.bind(authController)
);

// Endpoint para solicitar restablecimiento de contraseña
router.post(
  '/forgot-password',
  validate(validationService.validators.auth.passwordResetRequestSchema),
  authController.forgotPassword.bind(authController)
);

// Establecer nueva contraseña
router.post(
  '/reset-password',
  validate(validationService.validators.auth.passwordResetSchema),
  authController.resetPassword.bind(authController)
);

// Verificar email
router.get(
  '/verify-email/:token',
  validate(validationService.validators.auth.emailVerificationSchema, 'params'),
  authController.verifyEmail.bind(authController)
);

// Refrescar token
router.post(
  '/refresh-token',
  validate(validationService.validators.auth.refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

// Cambiar contraseña (requiere autenticación)
router.post(
  '/change-password',
  authenticateToken,
  validate(validationService.validators.auth.changePasswordSchema),
  authController.changePassword.bind(authController)
);

// Verificar 2FA
router.post(
  '/verify-2fa',
  validate(validationService.validators.auth.twoFactorVerifySchema),
  // Este endpoint se implementaría en el futuro
);

// Configurar 2FA (requiere autenticación)
router.post(
  '/setup-2fa',
  authenticateToken,
  validate(validationService.validators.auth.twoFactorSetupSchema),
  // Este endpoint se implementaría en el futuro
);

// Oauth login (Google, Facebook, etc.)
router.post(
  '/oauth-login',
  validate(validationService.validators.auth.oauthLoginSchema),
  // Este endpoint se implementaría en el futuro
);

export default router;

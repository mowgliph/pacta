import express from 'express';
import { AuthController } from '../../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const authController = AuthController();

// Registro de usuario
router.post(
  '/register',
  [
    body('username').not().isEmpty().withMessage('El nombre de usuario es requerido'),
    body('firstName').not().isEmpty().withMessage('El nombre es requerido'),
    body('lastName').not().isEmpty().withMessage('El apellido es requerido'),
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('role').optional(),
  ],
  validate(),
  authController.register,
);

// Iniciar sesión
router.post(
  '/login',
  [
    body('username').not().isEmpty().withMessage('El nombre de usuario es requerido'),
    body('password').not().isEmpty().withMessage('La contraseña es requerida'),
  ],
  validate(),
  authController.login,
);

// Cerrar sesión
router.post('/logout', authenticateToken, authController.logout);

// Verificar token
router.post('/verify-token', authController.verifyToken);

// Solicitar restablecimiento de contraseña
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Debe ser un email válido')],
  validate(),
  authController.forgotPassword,
);

// Restablecer contraseña con token
router.post(
  '/reset-password',
  [
    body('token').not().isEmpty().withMessage('El token es requerido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
  ],
  validate(),
  authController.resetPassword,
);

// Obtener información del usuario actual
router.get('/me', authenticateToken, authController.getProfile);

// Cambiar contraseña del usuario autenticado
router.put(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').not().isEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
      .matches(/[A-Z]/)
      .withMessage('La contraseña debe tener al menos una letra mayúscula')
      .matches(/[a-z]/)
      .withMessage('La contraseña debe tener al menos una letra minúscula')
      .matches(/[0-9]/)
      .withMessage('La contraseña debe tener al menos un número')
      .matches(/[^A-Za-z0-9]/)
      .withMessage('La contraseña debe tener al menos un carácter especial'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  ],
  validate(),
  authController.changePassword,
);

export default router;

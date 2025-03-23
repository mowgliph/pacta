import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Middleware para validar la creación/actualización de usuario
const validateUserData = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'advanced', 'readonly'])
    .withMessage('El rol debe ser admin, advanced o readonly')
];

// Rutas protegidas que requieren autenticación y rol de administrador
// Obtener todos los usuarios
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

// Obtener usuario por ID
router.get('/:id', authenticateToken, isAdmin, userController.getUserById);

// Crear usuario
router.post('/', [
  authenticateToken,
  isAdmin,
  body('username').notEmpty().withMessage('El nombre de usuario es requerido'),
  body('email').isEmail().withMessage('Debe proporcionar un email válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ...validateUserData
], userController.createUser);

// Actualizar usuario
router.put('/:id', [
  authenticateToken,
  isAdmin,
  ...validateUserData
], userController.updateUser);

// Eliminar usuario
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);

// Cambiar estado del usuario (activar/desactivar)
router.patch('/:id/toggle-status', authenticateToken, isAdmin, userController.toggleUserStatus);

// Rutas para el perfil del usuario actual (no requieren ser admin)
// Obtener perfil del usuario actual
router.get('/profile/me', authenticateToken, userController.getCurrentUser);

// Actualizar perfil del usuario actual
router.put('/profile/me', [
  authenticateToken,
  body('email').optional().isEmail().withMessage('Debe proporcionar un email válido')
], userController.updateProfile);

// Cambiar contraseña del usuario actual
router.put('/profile/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], userController.changePassword);

export default router; 
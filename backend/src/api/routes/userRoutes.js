/**
 * Rutas para gestión de usuarios
 */
import express from 'express';
import UserController from '../../controllers/UserController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorizationMiddleware.js';
import { validateUser, validateUserUpdate } from '../validators/userValidator.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Obtener lista de usuarios (paginada y con filtros)
 * @access Private - Admin
 */
router.get('/', authenticate, authorize(['ADMIN']), UserController.getUsers);

/**
 * @route GET /api/users/:id
 * @desc Obtener un usuario por ID
 * @access Private - Admin o propietario
 */
router.get('/:id', authenticate, UserController.getUserById);

/**
 * @route POST /api/users
 * @desc Crear un nuevo usuario
 * @access Private - Admin
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  apiLimiter,
  validateUser,
  UserController.createUser,
);

/**
 * @route PUT /api/users/:id
 * @desc Actualizar un usuario
 * @access Private - Admin o propietario
 */
router.put('/:id', authenticate, validateUserUpdate, UserController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Eliminar un usuario
 * @access Private - Admin
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), UserController.deleteUser);

/**
 * @route GET /api/users/profile
 * @desc Obtener perfil del usuario actual
 * @access Private - Usuario autenticado
 */
router.get('/profile', authenticate, UserController.getProfile);

/**
 * @route PUT /api/users/profile
 * @desc Actualizar perfil del usuario actual
 * @access Private - Usuario autenticado
 */
router.put('/profile', authenticate, UserController.updateProfile);

/**
 * @route PUT /api/users/profile/password
 * @desc Cambiar contraseña del usuario actual
 * @access Private - Usuario autenticado
 */
router.put('/profile/password', authenticate, UserController.changePassword);

/**
 * @route GET /api/users/role/:role
 * @desc Obtener usuarios por rol
 * @access Private - Admin
 */
router.get('/role/:role', authenticate, authorize(['ADMIN']), UserController.getUsersByRole);

/**
 * @route PATCH /api/users/:id/status
 * @desc Actualizar estado de un usuario
 * @access Private - Admin
 */
router.patch('/:id/status', authenticate, authorize(['ADMIN']), UserController.updateUserStatus);

/**
 * @route PATCH /api/users/:id/role
 * @desc Actualizar rol de un usuario
 * @access Private - Admin
 */
router.patch('/:id/role', authenticate, authorize(['ADMIN']), UserController.updateUserRole);

export default router;

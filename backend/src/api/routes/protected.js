/**
 * Rutas protegidas de la API (requieren autenticación)
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { prisma } from '../../database/prisma.js';
import multer from 'multer';
import LicenseValidator from '../services/licenseValidator.js';
import { authorize } from '../middleware/authorizationMiddleware.js';
import UserController from '../controllers/UserController.js';
import ContractController from '../controllers/ContractController.js';
import NotificationController from '../controllers/NotificationController.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Instanciar controladores
const userController = new UserController();
const contractController = new ContractController();
const notificationController = new NotificationController();

// Protected routes for all authenticated users
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        profileImage: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin only routes
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        profileImage: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Crear un nuevo usuario
router.post(
  '/users',
  authenticateToken,
  isAdmin,
  [
    body('firstName')
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .trim()
      .escape(),
    body('lastName')
      .isLength({ min: 2, max: 50 })
      .withMessage('El apellido debe tener entre 2 y 50 caracteres')
      .trim()
      .escape(),
    body('email')
      .isEmail()
      .withMessage('Debe proporcionar un correo electrónico válido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('role')
      .isIn(['ADMIN', 'MANAGER', 'USER', 'VIEWER'])
      .withMessage('Rol de usuario inválido'),
    body('departmentId')
      .optional()
      .isUUID()
      .withMessage('ID de departamento inválido'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, password, role, departmentId } = req.body;

      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
      }

      // Crear el usuario
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password, // La contraseña será hasheada por el modelo
          role,
          departmentId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          profileImage: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          department: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Registrar actividad
      await prisma.activity.create({
        data: {
          action: 'CREATE_USER',
          description: `Usuario ${user.email} creado`,
          userId: req.user.id,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error al crear el usuario' });
    }
  }
);

// Obtener un usuario específico
router.get('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        profileImage: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

// Actualizar un usuario
router.put(
  '/users/:id',
  authenticateToken,
  isAdmin,
  [
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .trim()
      .escape(),
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('El apellido debe tener entre 2 y 50 caracteres')
      .trim()
      .escape(),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Debe proporcionar un correo electrónico válido')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'MANAGER', 'USER', 'VIEWER'])
      .withMessage('Rol de usuario inválido'),
    body('departmentId')
      .optional()
      .isUUID()
      .withMessage('ID de departamento inválido'),
    body('status')
      .optional()
      .isBoolean()
      .withMessage('El campo status debe ser booleano'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.params.id;
      const { firstName, lastName, email, password, role, departmentId, status } = req.body;

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verificar si se está intentando actualizar el último administrador
      if ((user.role === 'ADMIN' && role === 'VIEWER') || role === 'MANAGER') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        if (adminCount <= 1) {
          return res.status(400).json({
            message: 'No se puede cambiar el rol del último administrador',
          });
        }
      }

      // Si se actualiza email, verificar que no exista ya
      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return res.status(400).json({
            message: 'El correo electrónico ya está registrado por otro usuario',
          });
        }
      }

      // Actualizar el usuario
      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (role) updateData.role = role;
      if (departmentId) updateData.departmentId = departmentId;
      if (status !== undefined) updateData.status = status;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          profileImage: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          department: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Registrar actividad
      await prisma.activity.create({
        data: {
          action: 'UPDATE_USER',
          description: `Usuario ID ${userId} actualizado`,
          userId: req.user.id,
        },
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  },
);

// Eliminar un usuario
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Evitar eliminar el propio usuario
    if (req.user.id.toString() === userId) {
      return res.status(400).json({
        message: 'No puedes eliminar tu propio usuario',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si es el último administrador
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'No se puede eliminar el último administrador del sistema',
        });
      }
    }

    // Registrar actividad antes de eliminar
    await prisma.activity.create({
      data: {
        action: 'DELETE_USER',
        description: `Usuario ${user.email} con rol ${user.role} eliminado`,
        userId: req.user.id,
      },
    });

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: 'Usuario eliminado exitosamente',
      userId,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// Contract management routes
router.get('/contracts', authenticateToken, async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      where: req.user.role === 'ADMIN' ? {} : { createdBy: req.user.id },
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// License management routes
router.get('/licenses', authenticateToken, isAdmin, async (req, res) => {
  try {
    const licenses = await prisma.license.findMany();
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new endpoint for password change
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
      .withMessage('Password must be at least 8 characters and contain letters and numbers'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      // Verify current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          password: newPassword,
          firstLogin: false,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          profileImage: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          department: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Registrar actividad
      await prisma.activity.create({
        data: {
          action: 'UPDATE_PASSWORD',
          description: `Usuario ID ${req.user.id} actualizó su contraseña`,
          userId: req.user.id,
        },
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      include: {
        contract: {
          select: {
            contractNumber: true,
            title: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// License validation endpoint
router.post('/validate-license', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { licenseKey } = req.body;

    // Simulate external API validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const license = await prisma.license.findUnique({
      where: {
        licenseKey,
        active: true,
        expiryDate: {
          gt: new Date(),
        },
      },
    });

    if (!license) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid or expired license key',
      });
    }

    // Log license validation
    await prisma.activity.create({
      data: {
        action: 'LICENSE_VALIDATION',
        description: `License key ${licenseKey} validated successfully`,
        userId: req.user.id,
      },
    });

    res.json({
      valid: true,
      license: {
        type: license.type,
        expiryDate: license.expiryDate,
        remainingDays: Math.ceil(
          (new Date(license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
        ),
      },
    });
  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({ message: 'Error validating license' });
  }
});

// Add utility endpoint to generate test licenses
router.post(
  '/generate-test-license',
  authenticateToken,
  isAdmin,
  [body('type').isIn(['DEMO', 'TRIAL', 'FULL']), body('durationDays').isInt({ min: 1, max: 365 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, durationDays } = req.body;
      const licenseKey = `PACTA-${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const license = await prisma.license.create({
        data: {
          licenseKey,
          type,
          startDate: new Date(),
          expiryDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
          active: true,
        },
      });

      await prisma.activity.create({
        data: {
          action: 'LICENSE_GENERATION',
          description: `Generated ${type} license key: ${licenseKey}`,
          userId: req.user.id,
        },
      });

      res.status(201).json({
        message: 'Test license generated successfully',
        license,
      });
    } catch (error) {
      console.error('License generation error:', error);
      res.status(500).json({ message: 'Error generating test license' });
    }
  },
);

// Configure multer for license file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/licenses');
  },
  filename: (req, file, cb) => {
    cb(null, `license-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.lic') {
      return cb(new Error('Only .lic files are allowed'));
    }
    cb(null, true);
  },
});

// Add license upload endpoint
router.post(
  '/upload-license',
  authenticateToken,
  isAdmin,
  upload.single('license'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No license file provided' });
      }

      const license = await LicenseValidator.validateLicenseFile(req.file.path, req.user.id);

      res.json({
        message: 'License uploaded and validated successfully',
        license,
      });
    } catch (error) {
      console.error('License upload error:', error);
      res.status(500).json({ message: 'Error uploading license file' });
    }
  },
);

// Get current license status
router.get('/license-status', authenticateToken, async (req, res) => {
  try {
    const status = await LicenseValidator.getCurrentLicenseStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error checking license status' });
  }
});

// Add trial code activation endpoint
router.post(
  '/activate-trial',
  authenticateToken,
  [
    body('trialCode')
      .notEmpty()
      .trim()
      .toUpperCase()
      .matches(/^(DEMOPACTA|TRYPACTA)$/)
      .withMessage('Invalid trial code format'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await LicenseValidator.validateTrialCode(req.body.trialCode, req.user.id);

      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({
        message: 'Trial activated successfully',
        license: result.license,
      });
    } catch (error) {
      console.error('Trial activation error:', error);
      res.status(500).json({ message: 'Error activating trial' });
    }
  },
);

// Get trial status endpoint
router.get('/trial-status', authenticateToken, async (req, res) => {
  try {
    const status = await LicenseValidator.checkTrialStatus(req.user.id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error checking trial status' });
  }
});

// Rutas de perfil de usuario (cualquier usuario autenticado)
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/profile/password', userController.changePassword);

// Rutas de contratos (cualquier usuario autenticado)
router.get('/contracts', contractController.getAllContracts);
router.get('/contracts/:id', contractController.getContractById);
router.post('/contracts', apiLimiter, contractController.createContract);
router.put('/contracts/:id', apiLimiter, contractController.updateContract);
router.delete('/contracts/:id', apiLimiter, contractController.deleteContract);
router.get('/contracts/search', contractController.searchContracts);
router.get('/contracts/stats', contractController.getContractStats);

// Rutas de notificaciones (cualquier usuario autenticado)
router.get('/notifications', notificationController.getUserNotifications);
router.get('/notifications/unread', notificationController.getUnreadCount);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all', notificationController.markAllAsRead);

// Ruta para usuarios con roles específicos
router.get('/team-data', authorize(['MANAGER', 'ADMIN']), userController.getTeamData);

export default router;

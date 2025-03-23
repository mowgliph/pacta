import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, isAdmin } from '../api/middleware/auth.js';
import { User, Contract, License, Notification, ActivityLog } from '../models/index.js';
import { Op } from 'sequelize';
import multer from 'multer';
import LicenseValidator from '../services/licenseValidator.js';
import { db } from '../database/dbconnection.js';

const router = express.Router();

// Protected routes for all authenticated users
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin only routes
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Crear un nuevo usuario
router.post('/users', authenticateToken, isAdmin, [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra y un número'),
  body('role')
    .isIn(['admin', 'advanced', 'readonly'])
    .withMessage('El rol debe ser admin, advanced o readonly')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role } = req.body;

    // Comprobar si el usuario ya existe
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'El nombre de usuario o email ya está en uso'
      });
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      username,
      email,
      password,
      role,
      firstLogin: true,
      active: true
    });

    // Registrar actividad
    await ActivityLog.create({
      userId: req.user.id,
      action: 'USER_CREATION',
      entityType: 'User',
      entityId: newUser.id,
      details: `Usuario ${username} creado con rol ${role}`
    });

    // Devolver el usuario creado sin la contraseña
    const userResponse = newUser.toJSON();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});

// Obtener un usuario específico
router.get('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] }
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
router.put('/users/:id', authenticateToken, isAdmin, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra y un número'),
  body('role')
    .optional()
    .isIn(['admin', 'advanced', 'readonly'])
    .withMessage('El rol debe ser admin, advanced o readonly'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('El campo active debe ser booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    const { username, email, password, role, active } = req.body;

    // Verificar que el usuario existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si se está intentando actualizar el último administrador
    if (user.role === 'admin' && role === 'readonly' || role === 'advanced') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'No se puede cambiar el rol del último administrador'
        });
      }
    }

    // Si se actualiza username o email, verificar que no exista ya
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: userId } },
            {
              [Op.or]: [
                username ? { username } : null,
                email ? { email } : null
              ].filter(condition => condition !== null)
            }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'El nombre de usuario o email ya está en uso por otro usuario'
        });
      }
    }

    // Actualizar el usuario
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    await user.update(updateData);

    // Registrar actividad
    await ActivityLog.create({
      userId: req.user.id,
      action: 'USER_UPDATE',
      entityType: 'User',
      entityId: user.id,
      details: `Usuario ID ${userId} actualizado`
    });

    // Devolver el usuario actualizado sin la contraseña
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.resetToken;
    delete userResponse.resetTokenExpiry;
    
    res.json({
      message: 'Usuario actualizado exitosamente',
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Evitar eliminar el propio usuario
    if (req.user.id.toString() === userId) {
      return res.status(400).json({ 
        message: 'No puedes eliminar tu propio usuario' 
      });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si es el último administrador
    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'No se puede eliminar el último administrador del sistema'
        });
      }
    }
    
    // Registrar actividad antes de eliminar
    await ActivityLog.create({
      userId: req.user.id,
      action: 'USER_DELETION',
      entityType: 'User',
      entityId: user.id,
      details: `Usuario ${user.username} con rol ${user.role} eliminado`
    });
    
    // Eliminar el usuario
    await user.destroy();
    
    res.json({ 
      message: 'Usuario eliminado exitosamente',
      userId
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// Contract management routes
router.get('/contracts', authenticateToken, async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id }
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// License management routes
router.get('/licenses', authenticateToken, isAdmin, async (req, res) => {
  try {
    const licenses = await License.findAll();
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new endpoint for password change
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword')
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must be at least 6 characters and contain letters and numbers'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    await user.update({ 
      password: newPassword,
      firstLogin: false
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Contract,
        attributes: ['contractNumber', 'title', 'endDate']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.update({ read: true });
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

    const license = await License.findOne({
      where: {
        licenseKey,
        active: true,
        expiryDate: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!license) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid or expired license key'
      });
    }

    // Log license validation
    await ActivityLog.create({
      userId: req.user.id,
      action: 'LICENSE_VALIDATION',
      entityType: 'License',
      entityId: license.id,
      details: `License key ${licenseKey} validated successfully`
    });

    res.json({
      valid: true,
      license: {
        type: license.type,
        expiryDate: license.expiryDate,
        remainingDays: Math.ceil((new Date(license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({ message: 'Error validating license' });
  }
});

// Add utility endpoint to generate test licenses
router.post('/generate-test-license', authenticateToken, isAdmin, [
  body('type').isIn(['DEMO', 'TRIAL', 'FULL']),
  body('durationDays').isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, durationDays } = req.body;
    const licenseKey = `PACTA-${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const license = await License.create({
      licenseKey,
      type,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      active: true
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'LICENSE_GENERATION',
      entityType: 'License',
      entityId: license.id,
      details: `Generated ${type} license key: ${licenseKey}`
    });

    res.status(201).json({
      message: 'Test license generated successfully',
      license
    });
  } catch (error) {
    console.error('License generation error:', error);
    res.status(500).json({ message: 'Error generating test license' });
  }
});

// Configure multer for license file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/licenses')
  },
  filename: (req, file, cb) => {
    cb(null, `license-${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.lic') {
      return cb(new Error('Only .lic files are allowed'));
    }
    cb(null, true);
  }
});

// Add license upload endpoint
router.post('/upload-license', authenticateToken, isAdmin, upload.single('license'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No license file provided' });
    }

    const license = await LicenseValidator.validateLicenseFile(req.file.path, req.user.id);
    
    res.json({
      message: 'License uploaded and validated successfully',
      license
    });
  } catch (error) {
    console.error('License upload error:', error);
    res.status(500).json({ message: 'Error uploading license file' });
  }
});

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
router.post('/activate-trial', authenticateToken, [
  body('trialCode')
    .notEmpty()
    .trim()
    .toUpperCase()
    .matches(/^(DEMOPACTA|TRYPACTA)$/)
    .withMessage('Invalid trial code format')
], async (req, res) => {
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
      license: result.license
    });
  } catch (error) {
    console.error('Trial activation error:', error);
    res.status(500).json({ message: 'Error activating trial' });
  }
});

// Get trial status endpoint
router.get('/trial-status', authenticateToken, async (req, res) => {
  try {
    const status = await LicenseValidator.checkTrialStatus(req.user.id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error checking trial status' });
  }
});

export default router;
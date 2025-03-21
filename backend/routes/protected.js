import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { User, Contract, License, Notification, ActivityLog } from '../models/index.js';
import { Op } from 'sequelize';
import multer from 'multer';
import LicenseValidator from '../services/licenseValidator.js';
import { db } from '../config/database.js';

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
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
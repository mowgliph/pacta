import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, isAdmin, requiresLicense } from '../middleware/auth.js';
import { Contract, User, ActivityLog } from '../models/index.js';
import { db } from '../config/database.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all contracts (filtered by user role) - solo lectura sin licencia
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ]
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contracts' });
  }
});

// Get contract by ID - solo lectura sin licencia
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { createdBy: req.user.id })
      }
    });
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contract' });
  }
});

// Create new contract - requiere licencia
router.post('/', [
  authenticateToken,
  requiresLicense, // Añadir middleware para verificar licencia
  body('title')
    .isLength({ min: 3, max: 100 })
    .trim()
    .escape()
    .withMessage('Title must be between 3 and 100 characters'),
  body('contractNumber')
    .notEmpty()
    .trim()
    .custom(async value => {
      const existingContract = await Contract.findOne({ where: { contractNumber: value } });
      if (existingContract) {
        throw new Error('Contract number already exists');
      }
      return true;
    }),
  body('startDate')
    .isISO8601()
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      if (startDate < today) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['CUP', 'USD', 'EUR'])
    .withMessage('Invalid currency'),
  body('notificationDays')
    .optional()
    .isInt({ min: 1, max: 90 })
    .withMessage('Notification days must be between 1 and 90')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const contract = await Contract.create({
      ...req.body,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'Contract',
      entityId: contract.id
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contract' });
  }
});

// Update contract - requiere licencia
router.put('/:id', [
  authenticateToken,
  requiresLicense, // Añadir middleware para verificar licencia
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .trim()
    .escape(),
  body('contractNumber')
    .optional()
    .trim()
    .custom(async (value, { req }) => {
      const existingContract = await Contract.findOne({ 
        where: { 
          contractNumber: value,
          id: { [Op.ne]: req.params.id }
        } 
      });
      if (existingContract) {
        throw new Error('Contract number already exists');
      }
      return true;
    }),
  body('startDate')
    .optional()
    .isISO8601()
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      if (startDate < today) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('endDate')
    .optional()
    .isISO8601()
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate || req.contract.startDate);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { createdBy: req.user.id })
      }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    await contract.update({
      ...req.body,
      lastModifiedBy: req.user.id
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entityType: 'Contract',
      entityId: contract.id
    });

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contract' });
  }
});

// Delete contract - requiere licencia
router.delete('/:id', authenticateToken, requiresLicense, async (req, res) => {
  try {
    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { createdBy: req.user.id })
      }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    await contract.destroy();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entityType: 'Contract',
      entityId: req.params.id
    });

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contract' });
  }
});

// Get contract statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const sequelize = db.sequelize;
    const { Op } = require('sequelize');
    const today = new Date();

    // Consultar todos los contratos del usuario o todos si es admin
    const contracts = await Contract.findAll({
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id }
    });

    // Calcular estadísticas
    const stats = {
      totalContracts: contracts.length,
      activeContracts: 0,
      expiringContracts: 0,
      expiredContracts: 0,
      totalByCurrency: {
        CUP: 0,
        USD: 0,
        EUR: 0
      }
    };

    // Calcular estadísticas
    contracts.forEach(contract => {
      // Contar por estado
      if (contract.status === 'active') {
        stats.activeContracts++;
        
        // Verificar si está próximo a vencer
        const daysUntilExpiry = Math.ceil(
          (new Date(contract.endDate) - today) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilExpiry <= contract.notificationDays) {
          stats.expiringContracts++;
        }
      } else if (contract.status === 'expired') {
        stats.expiredContracts++;
      }
      
      // Sumar importes por moneda
      if (contract.currency && stats.totalByCurrency[contract.currency] !== undefined) {
        stats.totalByCurrency[contract.currency] += parseFloat(contract.amount);
      }
    });

    // Obtener contratos más recientes (últimos 5)
    const recentContracts = await Contract.findAll({
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        }
      ]
    });

    // Obtener distribución por estado
    const statusCounts = {
      active: stats.activeContracts,
      expired: stats.expiredContracts,
      draft: contracts.filter(c => c.status === 'draft').length,
      terminated: contracts.filter(c => c.status === 'terminated').length,
      renewed: contracts.filter(c => c.status === 'renewed').length
    };

    // Devolver estadísticas completas
    res.json({
      stats,
      statusCounts,
      recentContracts
    });
    
  } catch (error) {
    console.error('Error fetching contract statistics:', error);
    res.status(500).json({ message: 'Error fetching contract statistics' });
  }
});

export default router;
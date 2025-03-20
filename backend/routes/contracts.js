import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { Contract, User, ActivityLog } from '../models/associations.js';

const router = Router();

// Get all contracts (filtered by user role)
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

// Get contract by ID
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

// Create new contract
router.post('/', [
  authenticateToken,
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

// Update contract
router.put('/:id', [
  authenticateToken,
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

// Delete contract
router.delete('/:id', authenticateToken, async (req, res) => {
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

export default router;
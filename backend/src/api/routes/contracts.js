import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, isAdmin, requiresLicense } from '../api/middleware/auth.js';
import { prisma } from '../../database/prisma.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as contractController from '../api/controllers/contractController.js';

const router = express.Router();

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/contracts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'contract-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Solo se permiten archivos PDF, Word, Excel y TXT'));
    }
    cb(null, true);
  },
});

// Get all contracts (filtered by user role) - solo lectura sin licencia
router.get('/', authenticateToken, contractController.getAllContracts);

// Get contract by ID - solo lectura sin licencia
router.get('/:id', authenticateToken, contractController.getContractById);

// Create new contract - requiere licencia
router.post(
  '/',
  [
    authenticateToken,
    requiresLicense,
    body('title')
      .isLength({ min: 3, max: 100 })
      .withMessage('El título debe tener entre 3 y 100 caracteres')
      .trim()
      .escape(),
    body('contractNumber')
      .notEmpty()
      .withMessage('El número de contrato es obligatorio')
      .trim()
      .custom(async value => {
        const existingContract = await prisma.contract.findUnique({ where: { contractNumber: value } });
        if (existingContract) {
          throw new Error('El número de contrato ya existe');
        }
        return true;
      }),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no debe exceder los 1000 caracteres')
      .trim(),
    body('startDate')
      .isISO8601()
      .withMessage('La fecha de inicio debe ser una fecha válida')
      .custom(value => {
        const startDate = new Date(value);
        const today = new Date();
        // Para contratos, permitir fechas en el pasado o futuro
        return true;
      }),
    body('endDate')
      .isISO8601()
      .withMessage('La fecha de fin debe ser una fecha válida')
      .custom((value, { req }) => {
        const endDate = new Date(value);
        const startDate = new Date(req.body.startDate);
        if (endDate <= startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        return true;
      }),
    body('status')
      .isIn(['draft', 'active', 'expired', 'terminated', 'renewed'])
      .withMessage('Estado no válido'),
    body('amount').isFloat({ min: 0 }).withMessage('El importe debe ser mayor o igual a 0'),
    body('currency').isIn(['CUP', 'USD', 'EUR']).withMessage('Moneda no válida'),
    body('notificationDays')
      .optional()
      .isInt({ min: 1, max: 90 })
      .withMessage('Los días de notificación deben estar entre 1 y 90'),
  ],
  upload.single('document'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }
    contractController.createContract(req, res);
  },
);

// Update contract - requiere licencia
router.put(
  '/:id',
  [
    authenticateToken,
    requiresLicense,
    body('title')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('El título debe tener entre 3 y 100 caracteres')
      .trim()
      .escape(),
    body('contractNumber')
      .optional()
      .trim()
      .custom(async (value, { req }) => {
        const existingContract = await prisma.contract.findUnique({
          where: {
            contractNumber: value,
            id: { not: req.params.id },
          },
        });
        if (existingContract) {
          throw new Error('El número de contrato ya existe');
        }
        return true;
      }),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no debe exceder los 1000 caracteres')
      .trim(),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('La fecha de inicio debe ser una fecha válida'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('La fecha de fin debe ser una fecha válida')
      .custom((value, { req }) => {
        if (!req.body.startDate && !req.contract) {
          return true;
        }

        const endDate = new Date(value);
        const startDate = new Date(req.body.startDate || req.contract.startDate);
        if (endDate <= startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        return true;
      }),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'expired', 'terminated', 'renewed'])
      .withMessage('Estado no válido'),
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El importe debe ser mayor o igual a 0'),
    body('currency').optional().isIn(['CUP', 'USD', 'EUR']).withMessage('Moneda no válida'),
    body('notificationDays')
      .optional()
      .isInt({ min: 1, max: 90 })
      .withMessage('Los días de notificación deben estar entre 1 y 90'),
  ],
  upload.single('document'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }
    contractController.updateContract(req, res);
  },
);

// Delete contract - requiere licencia
router.delete('/:id', authenticateToken, requiresLicense, contractController.deleteContract);

// Get contract document
router.get('/:id/document', authenticateToken, contractController.getContractDocument);

// Advanced search with filters
router.post('/search', authenticateToken, contractController.searchContracts);

// Get contract statistics
router.get('/statistics', authenticateToken, contractController.getContractStatistics);

// Cambiar estado de un contrato - nueva ruta
router.patch(
  '/:id/status',
  [
    authenticateToken,
    requiresLicense,
    body('status')
      .isIn(['draft', 'active', 'expired', 'terminated', 'renewed'])
      .withMessage('Estado no válido'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }
    contractController.changeContractStatus(req, res);
  },
);

export default router;

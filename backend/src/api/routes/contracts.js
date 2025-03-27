import express from 'express';
import { authenticateToken, requiresLicense } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as contractController from '../controllers/ContractController.js';
import { validate, validateAll } from '../middleware/validate.js';
import { ValidationService } from '../../services/ValidationService.js';

const router = express.Router();
const validationService = new ValidationService();

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
router.get(
  '/',
  authenticateToken,
  validate(validationService.validators.contract.contractQuerySchema, 'query'),
  contractController.getAllContracts,
);

// Get contract by ID - solo lectura sin licencia
router.get(
  '/:id',
  authenticateToken,
  validate(validationService.validators.contract.contractIdSchema, 'params'),
  contractController.getContractById,
);

// Create new contract - requiere licencia
router.post(
  '/',
  authenticateToken,
  requiresLicense,
  upload.single('document'),
  validate(validationService.validators.contract.contractCreateSchema),
  contractController.createContract,
);

// Update contract - requiere licencia
router.put(
  '/:id',
  authenticateToken,
  requiresLicense,
  upload.single('document'),
  validateAll({
    body: validationService.validators.contract.contractUpdateSchema,
    params: validationService.validators.contract.contractIdSchema,
  }),
  contractController.updateContract,
);

// Delete contract (soft delete) - requiere licencia
router.delete(
  '/:id',
  authenticateToken,
  requiresLicense,
  validate(validationService.validators.contract.contractIdSchema, 'params'),
  contractController.deleteContract,
);

// Search contracts - solo lectura sin licencia
router.get(
  '/search',
  authenticateToken,
  validate(validationService.validators.contract.contractSearchSchema, 'query'),
  contractController.searchContracts,
);

// Change contract status - requiere licencia
router.patch(
  '/:id/status',
  authenticateToken,
  requiresLicense,
  validateAll({
    body: validationService.validators.contract.contractStatusSchema,
    params: validationService.validators.contract.contractIdSchema,
  }),
  contractController.changeContractStatus,
);

// Add tags to contract - requiere licencia
router.post(
  '/:id/tags',
  authenticateToken,
  requiresLicense,
  validateAll({
    body: validationService.validators.contract.contractTagsSchema,
    params: validationService.validators.contract.contractIdSchema,
  }),
  contractController.addTags,
);

// Remove tags from contract - requiere licencia
router.delete(
  '/:id/tags',
  authenticateToken,
  requiresLicense,
  validateAll({
    body: validationService.validators.contract.contractTagsSchema,
    params: validationService.validators.contract.contractIdSchema,
  }),
  contractController.removeTags,
);

// Upload document to contract - requiere licencia
router.post(
  '/:id/documents',
  authenticateToken,
  requiresLicense,
  upload.single('document'),
  validate(validationService.validators.contract.contractIdSchema, 'params'),
  contractController.uploadDocument,
);

// Get contract statistics - solo lectura sin licencia
router.get(
  '/stats',
  authenticateToken,
  validate(validationService.validators.contract.contractStatsQuerySchema, 'query'),
  contractController.getContractStats,
);

export default router;

import express from 'express';
import { authenticateToken, requiresLicense } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { validate, validateAll } from '../middleware/validate.js';
import { ValidationService } from '../../services/ValidationService.js';
import { DocumentController } from '../controllers/DocumentController.js';

const router = express.Router();
const validationService = new ValidationService();
const documentController = new DocumentController();

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB máximo
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.txt',
      '.jpg',
      '.jpeg',
      '.png',
      '.zip',
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Tipo de archivo no permitido'));
    }
    cb(null, true);
  },
});

// Obtener todos los documentos (con filtros y paginación)
router.get(
  '/',
  authenticateToken,
  validate(validationService.validators.document.documentQuerySchema, 'query'),
  documentController.getAllDocuments,
);

// Obtener un documento por ID
router.get(
  '/:id',
  authenticateToken,
  validate(validationService.validators.document.documentIdSchema, 'params'),
  documentController.getDocumentById,
);

// Crear un nuevo documento (requiere licencia)
router.post(
  '/',
  authenticateToken,
  requiresLicense,
  upload.single('file'),
  validate(validationService.validators.document.documentCreateSchema),
  documentController.createDocument,
);

// Actualizar un documento (requiere licencia)
router.put(
  '/:id',
  authenticateToken,
  requiresLicense,
  upload.single('file'),
  validateAll({
    body: validationService.validators.document.documentUpdateSchema,
    params: validationService.validators.document.documentIdSchema,
  }),
  documentController.updateDocument,
);

// Eliminar un documento (requiere licencia)
router.delete(
  '/:id',
  authenticateToken,
  requiresLicense,
  validate(validationService.validators.document.documentIdSchema, 'params'),
  documentController.deleteDocument,
);

// Buscar documentos
router.get(
  '/search',
  authenticateToken,
  validate(validationService.validators.document.documentSearchSchema, 'query'),
  documentController.searchDocuments,
);

// Descargar un documento
router.get(
  '/:id/download',
  authenticateToken,
  validate(validationService.validators.document.documentIdSchema, 'params'),
  documentController.downloadDocument,
);

// Compartir un documento (generar link público)
router.post(
  '/:id/share',
  authenticateToken,
  requiresLicense,
  validateAll({
    params: validationService.validators.document.documentIdSchema,
    body: validationService.validators.document.documentShareSchema,
  }),
  documentController.shareDocument,
);

// Gestionar permisos de un documento
router.post(
  '/:id/permissions',
  authenticateToken,
  requiresLicense,
  validateAll({
    params: validationService.validators.document.documentIdSchema,
    body: validationService.validators.document.documentPermissionSchema,
  }),
  documentController.setDocumentPermissions,
);

// Actualizar permisos de un documento
router.put(
  '/:id/permissions/:userId',
  authenticateToken,
  requiresLicense,
  validateAll({
    params: validationService.validators.document.documentPermissionParamsSchema,
    body: validationService.validators.document.updateDocumentPermissionSchema,
  }),
  documentController.updateDocumentPermissions,
);

// Eliminar permisos de un documento
router.delete(
  '/:id/permissions/:userId',
  authenticateToken,
  requiresLicense,
  validate(validationService.validators.document.documentPermissionParamsSchema, 'params'),
  documentController.removeDocumentPermissions,
);

// Obtener versiones de un documento
router.get(
  '/:id/versions',
  authenticateToken,
  validate(validationService.validators.document.documentIdSchema, 'params'),
  documentController.getDocumentVersions,
);

// Revertir a una versión anterior
router.post(
  '/:id/revert/:versionId',
  authenticateToken,
  requiresLicense,
  validate(validationService.validators.document.documentRevertSchema, 'params'),
  documentController.revertToVersion,
);

export default router;

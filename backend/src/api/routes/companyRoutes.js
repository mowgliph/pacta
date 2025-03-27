/**
 * Rutas para la gestión de compañías
 */
import express from 'express';
import { CompanyController } from '../controllers/CompanyController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { validate, validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { ValidationService } from '../../services/ValidationService.js';

const router = express.Router();
const controller = new CompanyController();
const validationService = new ValidationService();

// Obtener todas las compañías con filtros y paginación
router.get(
  '/',
  authenticateToken,
  validateQuery(validationService.searchCompanySchema()),
  controller.getAllCompanies,
);

// Obtener una compañía por ID
router.get(
  '/:id',
  authenticateToken,
  validateParams(validationService.companyIdSchema()),
  controller.getCompanyById,
);

// Crear una nueva compañía
router.post(
  '/',
  authenticateToken,
  isAdmin,
  validateBody(validationService.createCompanySchema()),
  controller.createCompany,
);

// Actualizar una compañía existente
router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  validate({
    params: validationService.companyIdSchema(),
    body: validationService.updateCompanySchema(),
  }),
  controller.updateCompany,
);

// Eliminar una compañía
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  validateParams(validationService.companyIdSchema()),
  controller.deleteCompany,
);

// Rutas para departamentos
router.post(
  '/departments',
  authenticateToken,
  isAdmin,
  validateBody(validationService.createDepartmentSchema()),
  controller.createDepartment,
);

router.put(
  '/departments/:id',
  authenticateToken,
  isAdmin,
  validate({
    params: validationService.departmentIdSchema(),
    body: validationService.updateDepartmentSchema(),
  }),
  controller.updateDepartment,
);

router.delete(
  '/departments/:id',
  authenticateToken,
  isAdmin,
  validateParams(validationService.departmentIdSchema()),
  controller.deleteDepartment,
);

// Rutas para análisis y consultas específicas
router.get('/top/by-contracts', authenticateToken, controller.getTopCompaniesByContracts);
router.get(
  '/with-expiring-contracts',
  authenticateToken,
  controller.getCompaniesWithExpiringContracts,
);

export default router;

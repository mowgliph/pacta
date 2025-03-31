/**
 * Rutas para la gestión de compañías
 */
import express from 'express';
import companyController from '../controllers/CompanyController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { validate, validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { ValidationService } from '../../services/ValidationService.js';

const router = express.Router();
const validationService = new ValidationService();

// Obtener todas las compañías con filtros y paginación
router.get(
  '/',
  authenticateToken,
  validateQuery(validationService.searchCompanySchema()),
  companyController.getAllCompanies,
);

// Obtener una compañía por ID
router.get(
  '/:id',
  authenticateToken,
  validateParams(validationService.companyIdSchema()),
  companyController.getCompanyById,
);

// Crear una nueva compañía
router.post(
  '/',
  authenticateToken,
  isAdmin,
  validateBody(validationService.createCompanySchema()),
  companyController.createCompany,
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
  companyController.updateCompany,
);

// Eliminar una compañía
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  validateParams(validationService.companyIdSchema()),
  companyController.deleteCompany,
);

// Rutas para departamentos
router.post(
  '/departments',
  authenticateToken,
  isAdmin,
  validateBody(validationService.createDepartmentSchema()),
  companyController.createDepartment,
);

router.put(
  '/departments/:id',
  authenticateToken,
  isAdmin,
  validate({
    params: validationService.departmentIdSchema(),
    body: validationService.updateDepartmentSchema(),
  }),
  companyController.updateDepartment,
);

router.delete(
  '/departments/:id',
  authenticateToken,
  isAdmin,
  validateParams(validationService.departmentIdSchema()),
  companyController.deleteDepartment,
);

// Rutas para análisis y consultas específicas
router.get('/top/by-contracts', authenticateToken, companyController.getTopCompaniesByContracts);
router.get(
  '/with-expiring-contracts',
  authenticateToken,
  companyController.getCompaniesWithExpiringContracts,
);

export default router;

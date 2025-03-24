/**
 * Rutas para la gestión de compañías
 */
import express from 'express';
import { CompanyController } from '../controllers/CompanyController.js';

const router = express.Router();
const controller = new CompanyController();

// Obtener todas las compañías con filtros y paginación
router.get('/', controller.getAllCompanies);

// Obtener una compañía por ID
router.get('/:id', controller.getCompanyById);

// Crear una nueva compañía
router.post('/', controller.createCompany);

// Actualizar una compañía existente
router.put('/:id', controller.updateCompany);

// Rutas para análisis y consultas específicas
router.get('/top/by-contracts', controller.getTopCompaniesByContracts);
router.get('/with-expiring-contracts', controller.getCompaniesWithExpiringContracts);

export default router;

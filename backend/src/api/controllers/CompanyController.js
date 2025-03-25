/**
 * Controlador para la gestión de compañías
 * Expone endpoints de la API para operaciones CRUD y consultas específicas de compañías
 */
import { BaseController } from './BaseController.js';
import { CompanyService } from '../../services/CompanyService.js';
import { ResponseService } from '../../services/ResponseService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { ValidationError } from '../../utils/errors.js';

export class CompanyController extends BaseController {
  constructor() {
    const companyService = new CompanyService();
    super(companyService);
    this.companyService = companyService;
    this.validationService = new ValidationService();
  }

  /**
   * Obtiene todas las compañías con paginación y filtros
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getAllCompanies = async (req, res, next) => {
    try {
      // Validar parámetros de consulta
      const validatedQuery = await this.validationService.validateCompanySearch(req.query);

      // Obtener datos
      const result = await this.companyService.getCompanies(
        validatedQuery, 
        validatedQuery.page || 1, 
        validatedQuery.limit || 10
      );

      // Responder
      res.status(200).json(ResponseService.paginate(result.data, result.pagination));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('Parámetros de consulta inválidos', 400, error.details));
      }
      next(error);
    }
  };

  /**
   * Obtiene una compañía por ID
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getCompanyById = async (req, res, next) => {
    try {
      // Validar ID
      const { id } = await this.validationService.validateCompanyId({ id: req.params.id });
      
      const result = await this.companyService.getById(id);

      if (!result) {
        return res.status(404).json(ResponseService.error('Company not found', 404));
      }

      res.status(200).json(ResponseService.success(result));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('ID de compañía inválido', 400, error.details));
      }
      next(error);
    }
  };

  /**
   * Crea una nueva compañía
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  createCompany = async (req, res, next) => {
    try {
      // Validar datos
      const validatedData = await this.validationService.validateCompanyCreation(req.body);

      // Crear compañía
      const result = await this.companyService.createCompany(validatedData);

      res.status(201).json(ResponseService.created(result));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('Datos de compañía inválidos', 400, error.details));
      }
      next(error);
    }
  };

  /**
   * Actualiza una compañía existente
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  updateCompany = async (req, res, next) => {
    try {
      // Validar ID
      const { id } = await this.validationService.validateCompanyId({ id: req.params.id });
      
      // Validar datos
      const validatedData = await this.validationService.validateCompanyUpdate(req.body);

      // Actualizar compañía
      const result = await this.companyService.updateCompany(id, validatedData);

      if (!result) {
        return res.status(404).json(ResponseService.error('Company not found', 404));
      }

      res.status(200).json(ResponseService.updated(result));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('Datos de actualización inválidos', 400, error.details));
      }
      next(error);
    }
  };

  /**
   * Elimina una compañía
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  deleteCompany = async (req, res, next) => {
    try {
      // Validar ID
      const { id } = await this.validationService.validateCompanyId({ id: req.params.id });
      
      // Eliminar compañía
      const result = await this.companyService.deleteCompany(id);

      if (!result) {
        return res.status(404).json(ResponseService.error('Company not found', 404));
      }

      res.status(200).json(ResponseService.success({ message: 'Company deleted successfully' }));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('ID de compañía inválido', 400, error.details));
      }
      next(error);
    }
  };

  /**
   * Obtiene las compañías con más contratos
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getTopCompaniesByContracts = async (req, res, next) => {
    try {
      const { limit = 5 } = req.query;
      const limitNum = parseInt(limit, 10);

      const result = await this.companyService.getTopCompaniesByContracts(limitNum);

      res.status(200).json(ResponseService.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene compañías con contratos a punto de vencer
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getCompaniesWithExpiringContracts = async (req, res, next) => {
    try {
      const { daysThreshold = 30 } = req.query;
      const daysNum = parseInt(daysThreshold, 10);

      const result = await this.companyService.getCompaniesWithExpiringContracts(daysNum);

      res.status(200).json(ResponseService.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea un nuevo departamento para una compañía
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  createDepartment = async (req, res, next) => {
    try {
      // Validar datos
      const validatedData = await this.validationService.validateDepartmentCreation(req.body);

      // Crear departamento
      const result = await this.companyService.createDepartment(validatedData);

      res.status(201).json(ResponseService.created(result));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('Datos de departamento inválidos', 400, error.details));
      }
      next(error);
    }
  };

  /**
   * Actualiza un departamento existente
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  updateDepartment = async (req, res, next) => {
    try {
      // Validar ID
      const { id } = await this.validationService.validateDepartmentId({ id: req.params.id });
      
      // Validar datos
      const validatedData = await this.validationService.validateDepartmentUpdate(req.body);

      // Actualizar departamento
      const result = await this.companyService.updateDepartment(id, validatedData);

      if (!result) {
        return res.status(404).json(ResponseService.error('Department not found', 404));
      }

      res.status(200).json(ResponseService.updated(result));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('Datos de actualización inválidos', 400, error.details));
      }
      next(error);
    }
  };

  /**
   * Elimina un departamento
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  deleteDepartment = async (req, res, next) => {
    try {
      // Validar ID
      const { id } = await this.validationService.validateDepartmentId({ id: req.params.id });
      
      // Eliminar departamento
      const result = await this.companyService.deleteDepartment(id);

      if (!result) {
        return res.status(404).json(ResponseService.error('Department not found', 404));
      }

      res.status(200).json(ResponseService.success({ message: 'Department deleted successfully' }));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json(ResponseService.error('ID de departamento inválido', 400, error.details));
      }
      next(error);
    }
  };
}

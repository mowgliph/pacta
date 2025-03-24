/**
 * Controlador para la gestión de compañías
 * Expone endpoints de la API para operaciones CRUD y consultas específicas de compañías
 */
import { BaseController } from './BaseController.js';
import { CompanyService } from '../../services/CompanyService.js';
import { ResponseService } from '../../services/ResponseService.js';
import { ValidationService } from '../../services/ValidationService.js';

export class CompanyController extends BaseController {
  constructor() {
    const companyService = new CompanyService();
    super(companyService);
    this.companyService = companyService;
  }

  /**
   * Obtiene todas las compañías con paginación y filtros
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getAllCompanies = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        industry,
        status,
        sortBy,
        sortOrder,
        ...filters
      } = req.query;

      // Conversión de tipos
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      // Preparar filtros
      const queryFilters = { ...filters };

      if (search) {
        queryFilters.search = search;
      }

      if (industry) {
        queryFilters.industry = industry;
      }

      if (status) {
        queryFilters.status = status;
      }

      // Opciones de ordenamiento
      if (sortBy) {
        queryFilters.sortBy = sortBy;
        queryFilters.sortOrder = sortOrder || 'asc';
      }

      // Obtener datos
      const result = await this.companyService.getCompanies(queryFilters, pageNum, limitNum);

      // Responder
      res.status(200).json(ResponseService.paginate(result.data, result.pagination));
    } catch (error) {
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
      const { id } = req.params;
      const result = await this.companyService.getById(id);

      if (!result) {
        return res.status(404).json(ResponseService.error('Company not found', 404));
      }

      res.status(200).json(ResponseService.success(result));
    } catch (error) {
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
      const data = req.body;

      // Validar datos
      const schema = {
        name: { type: 'string', required: true },
        taxId: { type: 'string', optional: true },
        industry: { type: 'string', optional: true },
        address: { type: 'string', optional: true },
        city: { type: 'string', optional: true },
        state: { type: 'string', optional: true },
        country: { type: 'string', optional: true },
        postalCode: { type: 'string', optional: true },
        contactName: { type: 'string', optional: true },
        contactEmail: { type: 'string', optional: true },
        contactPhone: { type: 'string', optional: true },
        status: { type: 'string', optional: true },
        notes: { type: 'string', optional: true },
      };

      await ValidationService.validate(schema, data);

      // Crear compañía
      const result = await this.companyService.createCompany(data);

      res.status(201).json(ResponseService.created(result));
    } catch (error) {
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
      const { id } = req.params;
      const data = req.body;

      // Validar datos
      const schema = {
        name: { type: 'string', optional: true },
        taxId: { type: 'string', optional: true },
        industry: { type: 'string', optional: true },
        address: { type: 'string', optional: true },
        city: { type: 'string', optional: true },
        state: { type: 'string', optional: true },
        country: { type: 'string', optional: true },
        postalCode: { type: 'string', optional: true },
        contactName: { type: 'string', optional: true },
        contactEmail: { type: 'string', optional: true },
        contactPhone: { type: 'string', optional: true },
        status: { type: 'string', optional: true },
        notes: { type: 'string', optional: true },
      };

      await ValidationService.validate(schema, data);

      // Actualizar compañía
      const result = await this.companyService.updateCompany(id, data);

      res.status(200).json(ResponseService.updated(result));
    } catch (error) {
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
}

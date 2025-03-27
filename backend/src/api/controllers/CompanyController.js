import { BaseController } from './BaseController.js';
import { CompanyService } from '../../services/CompanyService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { NotFoundError } from '../../utils/errors.js';

export class CompanyController extends BaseController {
  constructor() {
    const companyService = new CompanyService();
    super(companyService);
    this.companyService = companyService;
    this.validationService = new ValidationService();
  }

  getAllCompanies = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const filters = {
          ...req.query,
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10
        };
        return await this.companyService.getAllCompanies(filters);
      },
      { filters: req.query }
    );
  };

  getCompanyById = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const company = await this.companyService.getCompanyById(id);
        if (!company) {
          throw new NotFoundError('Compañía no encontrada');
        }
        return company;
      },
      { companyId: req.params.id }
    );
  };

  createCompany = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const validatedData = await this.validationService.validateCompanyData(req.body);
        return await this.companyService.createCompany(validatedData);
      },
      { companyData: req.body }
    );
  };

  updateCompany = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const validatedData = await this.validationService.validateCompanyData(req.body);
        return await this.companyService.updateCompany(id, validatedData);
      },
      { companyId: req.params.id, updates: req.body }
    );
  };

  deleteCompany = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        await this.companyService.deleteCompany(id);
        return { message: 'Compañía eliminada exitosamente' };
      },
      { companyId: req.params.id }
    );
  };

  getCompanyStats = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        return await this.companyService.getCompanyStats(id);
      },
      { companyId: req.params.id }
    );
  };
}

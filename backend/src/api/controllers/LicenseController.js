import { BaseController } from './BaseController.js';
import { LicenseService } from '../../services/LicenseService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export class LicenseController extends BaseController {
  constructor() {
    const licenseService = new LicenseService();
    super(licenseService);
    this.licenseService = licenseService;
    this.validationService = new ValidationService();
  }

  getLicenseStatus = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        return await this.licenseService.getCurrentLicense();
      },
      { action: 'getLicenseStatus' }
    );
  };

  activateLicense = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const validatedData = await this.validationService.validateLicenseKey(req.body);
        return await this.licenseService.activateLicense(validatedData.licenseKey);
      },
      { action: 'activateLicense' }
    );
  };

  deactivateLicense = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        return await this.licenseService.deactivateLicense(id);
      },
      { licenseId: req.params.id }
    );
  };

  getLicenseHistory = async (req, res) => {
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
        return await this.licenseService.getLicenseHistory(filters);
      },
      { filters: req.query }
    );
  };

  validateLicense = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { licenseKey } = req.body;
        if (!licenseKey) {
          throw new ValidationError('Clave de licencia requerida');
        }
        return await this.licenseService.validateLicense(licenseKey);
      },
      { action: 'validateLicense' }
    );
  };
}

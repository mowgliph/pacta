import { BaseController } from './BaseController.js';
import { SystemService } from '../../services/SystemService.js';
import { ValidationError } from '../../utils/errors.js';
import pkg from '../../../package.json';

export class IndexController extends BaseController {
  constructor() {
    const systemService = new SystemService();
    super(systemService);
    this.systemService = systemService;
  }

  getApiInfo = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        return {
          name: pkg.name,
          version: pkg.version,
          description: pkg.description,
          environment: process.env.NODE_ENV || 'development'
        };
      },
      { action: 'getApiInfo' }
    );
  };

  healthCheck = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const status = await this.systemService.checkHealth();
        if (!status.healthy) {
          throw new ValidationError('Sistema no disponible');
        }
        return {
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          memory: process.memoryUsage(),
          ...status
        };
      },
      { action: 'healthCheck' }
    );
  };

  getSystemMetrics = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        return await this.systemService.getMetrics();
      },
      { action: 'getSystemMetrics' }
    );
  };
}

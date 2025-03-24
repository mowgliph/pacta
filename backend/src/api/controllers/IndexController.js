/**
 * Controlador para gestionar información general de la API
 * Proporciona endpoints para documentación y salud del sistema
 */
import { ResponseService } from '../../services/ResponseService.js';
import os from 'os';
import { version } from '../../../package.json';

class IndexController {
  /**
   * Obtiene información general de la API
   * @param {Object} req - Request Express
   * @param {Object} res - Response Express
   */
  async getApiInfo(req, res) {
    const apiInfo = {
      name: 'PACTA API',
      version,
      description: 'API para la gestión de contratos y licencias de software',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        companies: '/api/companies',
        contracts: '/api/contracts',
        notifications: '/api/notifications',
        analytics: '/api/analytics',
        health: '/api/health',
        docs: '/api/docs',
      },
    };

    return res
      .status(200)
      .json(ResponseService.success('API information retrieved successfully', apiInfo));
  }

  /**
   * Verifica el estado de salud del sistema
   * @param {Object} req - Request Express
   * @param {Object} res - Response Express
   */
  async healthCheck(req, res) {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const healthInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'development',
    };

    return res
      .status(200)
      .json(ResponseService.success('System health check completed', healthInfo));
  }

  /**
   * Obtiene estadísticas del sistema (solo admin)
   * @param {Object} req - Request Express
   * @param {Object} res - Response Express
   */
  async getSystemStats(req, res) {
    // Verificar que sea admin
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json(ResponseService.error('Unauthorized: Admin access required', 403));
    }

    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.cpus();
    const uptime = process.uptime();

    const systemStats = {
      memory: {
        total: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
        free: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
        usage: `${Math.round((memoryUsage.rss / os.totalmem()) * 100)}%`,
      },
      cpu: {
        cores: cpuUsage.length,
        model: cpuUsage[0].model,
        speed: `${cpuUsage[0].speed} MHz`,
      },
      uptime: {
        server: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        os: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m ${Math.floor(os.uptime() % 60)}s`,
      },
      platform: process.platform,
      version: process.version,
    };

    return res
      .status(200)
      .json(ResponseService.success('System statistics retrieved successfully', systemStats));
  }
}

export default new IndexController();

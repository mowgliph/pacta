/**
 * Controlador para gestionar información general de la API
 * Proporciona endpoints para documentación y salud del sistema
 */
import { ResponseService } from '../../services/ResponseService.js';
import { version } from '../../../package.json';

export class IndexController {
  /**
   * Punto de entrada a la API
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getApiInfo = async (req, res, next) => {
    try {
      const apiInfo = {
        name: 'PACTA API',
        version,
        description: 'API REST para el sistema de gestión de contratos PACTA',
        endpoints: {
          base: '/api',
          auth: '/api/auth',
          users: '/api/users',
          companies: '/api/companies',
          contracts: '/api/contracts',
          notifications: '/api/notifications',
          analytics: '/api/analytics',
          health: '/api/health',
        },
        documentation: '/api/docs',
      };

      return res.status(200).json(ResponseService.success(apiInfo));
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Comprueba la salud del sistema
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  healthCheck = async (req, res, next) => {
    try {
      const healthInfo = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        version,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
      };

      return res.status(200).json(ResponseService.success(healthInfo));
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Obtener estadísticas básicas del sistema
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getSystemStats = async (req, res, next) => {
    try {
      // Solo permitir a administradores acceder a estas estadísticas
      if (!req.user?.isAdmin) {
        return res
          .status(403)
          .json(ResponseService.error('Unauthorized: Admin access required', 403));
      }

      // En una implementación real, aquí obtendríamos estadísticas del sistema
      // Ejemplo: CPU, memoria, conexiones a BD, usuarios activos, etc.
      const stats = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: Math.floor(process.uptime()),
        // Otras estadísticas que vendrían desde servicios dedicados
      };

      return res.status(200).json(ResponseService.success(stats));
    } catch (error) {
      return next(error);
    }
  };
}

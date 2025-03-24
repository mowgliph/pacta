/**
 * Controlador base para todos los controladores de la API
 * Implementa métodos CRUD comunes y manejo de errores centralizado
 */
import { ResponseService } from '../../services/ResponseService.js';
import { LoggingService } from '../../services/LoggingService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { CacheService } from '../../services/CacheService.js';
import {
  ValidationError as _ValidationError,
  NotFoundError as _NotFoundError,
  ConflictError as _ConflictError,
  AuthenticationError as _AuthenticationError,
} from '../../utils/errors.js';

export class BaseController {
  constructor(service) {
    if (!service) {
      throw new Error('Service is required for BaseController');
    }
    this.service = service;
    this.sendResponse = this.sendResponse.bind(this);
    this.sendError = this.sendError.bind(this);
  }

  /**
   * Obtiene todas las entidades con paginación
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getAll = async (req, res, next) => {
    try {
      // Extraer parámetros de paginación y filtrado
      const { page = 1, limit = 10, ...query } = req.query;

      // Conversión de tipos
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      // Obtener datos
      const result = await this.service.getAll(query, pageNum, limitNum);

      // Responder
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene una entidad por ID
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.service.getById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea una nueva entidad
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  create = async (req, res, next) => {
    try {
      const data = req.body;
      const result = await this.service.create(data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza una entidad existente
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await this.service.update(id, data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Elimina una entidad
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;

      await this.service.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  async bulkCreate(req, res, next) {
    try {
      const data = req.body;
      const options = req.query;

      const result = await this.service.bulkCreate(data, options);
      res.status(201).json(ResponseService.created(result));
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdate(req, res, next) {
    try {
      const data = req.body;
      const options = req.query;

      const result = await this.service.bulkUpdate(data, options);
      res.json(ResponseService.updated(result));
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req, res, next) {
    try {
      const { ids } = req.body;
      const options = req.query;

      await Promise.all(ids.map(id => this.service.delete(id, options)));
      res.json(ResponseService.deleted());
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { query, fields, page = 1, limit = 10 } = req.query;
      const options = { query, fields, page, limit };

      const result = await this.service.search(options);
      res.json(ResponseService.paginate(result.data, result.pagination));
    } catch (error) {
      next(error);
    }
  }

  async count(req, res, next) {
    try {
      const filters = req.query;
      const count = await this.service.count(filters);
      res.json(ResponseService.success({ count }));
    } catch (error) {
      next(error);
    }
  }

  async validateRequest(schema) {
    return async (req, res, next) => {
      try {
        const validatedData = await ValidationService.validate(schema, req.body);
        req.body = validatedData;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  async cacheResponse(ttl = 600) {
    return async (req, res, next) => {
      try {
        const cacheKey = `cache:${req.originalUrl}`;
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json(ResponseService.success(cachedData));
        }

        const originalJson = res.json;
        res.json = function (data) {
          CacheService.set(cacheKey, data, ttl);
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  async logOperation(operation) {
    return async (req, res, next) => {
      try {
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          LoggingService.info(`${operation} completed`, {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id,
          });
        });
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  sendResponse(res, data, statusCode = 200, message = 'Success') {
    res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  sendError(res, error, statusCode = 500) {
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  sendPaginatedResponse(res, data, page, limit, total, message = 'Success') {
    res.status(200).json({
      status: 'success',
      message,
      data,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }

  // Helper method for handling async operations
  async handleAsync(req, res, next, operation) {
    try {
      const result = await operation();
      return this.sendResponse(res, result);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // Helper method for handling file uploads
  handleFileUpload(req, res, next) {
    if (!req.file) {
      return this.sendError(res, new Error('No file uploaded'), 400);
    }
    next();
  }
}

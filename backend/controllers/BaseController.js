import { ResponseService } from '../services/ResponseService.js';
import { LoggingService } from '../services/LoggingService.js';
import { ValidationService } from '../services/ValidationService.js';
import { CacheService } from '../services/CacheService.js';

export class BaseController {
  constructor(service) {
    this.service = service;
  }

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const options = { ...filters };

      const result = await this.service.paginate(page, limit, options);
      res.json(ResponseService.paginate(result.data, result.pagination));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const options = req.query;

      const result = await this.service.getById(id, options);
      res.json(ResponseService.success(result));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = req.body;
      const options = req.query;

      const result = await this.service.create(data, options);
      res.status(201).json(ResponseService.created(result));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const options = req.query;

      const result = await this.service.update(id, data, options);
      res.json(ResponseService.updated(result));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const options = req.query;

      await this.service.delete(id, options);
      res.json(ResponseService.deleted());
    } catch (error) {
      next(error);
    }
  }

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
        res.json = function(data) {
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
            userId: req.user?.id
          });
        });
        next();
      } catch (error) {
        next(error);
      }
    };
  }
} 
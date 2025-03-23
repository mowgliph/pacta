import { LoggingService } from './LoggingService.js';
import { CacheService } from './CacheService.js';
import { ValidationError, DatabaseError } from '../utils/errors.js';

export class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAll(options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.findAll(options);
      const duration = Date.now() - start;

      LoggingService.logDatabaseQuery('findAll', duration);
      return result;
    } catch (error) {
      LoggingService.error('Error fetching records', { error: error.message });
      throw new DatabaseError('Error fetching records', error);
    }
  }

  async getById(id, options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.findById(id, options);
      const duration = Date.now() - start;

      if (!result) {
        throw new ValidationError(`Record with id ${id} not found`);
      }

      LoggingService.logDatabaseQuery('findById', duration);
      return result;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      LoggingService.error('Error fetching record', { id, error: error.message });
      throw new DatabaseError('Error fetching record', error);
    }
  }

  async create(data, options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.create(data, options);
      const duration = Date.now() - start;

      LoggingService.logDatabaseQuery('create', duration);
      return result;
    } catch (error) {
      LoggingService.error('Error creating record', { data, error: error.message });
      throw new DatabaseError('Error creating record', error);
    }
  }

  async update(id, data, options = {}) {
    try {
      const start = Date.now();
      const updated = await this.repository.update(id, data, options);
      const duration = Date.now() - start;

      if (!updated) {
        throw new ValidationError(`Record with id ${id} not found`);
      }

      LoggingService.logDatabaseQuery('update', duration);
      return await this.getById(id, options);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      LoggingService.error('Error updating record', { id, data, error: error.message });
      throw new DatabaseError('Error updating record', error);
    }
  }

  async delete(id, options = {}) {
    try {
      const start = Date.now();
      const deleted = await this.repository.delete(id, options);
      const duration = Date.now() - start;

      if (!deleted) {
        throw new ValidationError(`Record with id ${id} not found`);
      }

      LoggingService.logDatabaseQuery('delete', duration);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      LoggingService.error('Error deleting record', { id, error: error.message });
      throw new DatabaseError('Error deleting record', error);
    }
  }

  async findOne(options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.findOne(options);
      const duration = Date.now() - start;

      LoggingService.logDatabaseQuery('findOne', duration);
      return result;
    } catch (error) {
      LoggingService.error('Error finding record', { options, error: error.message });
      throw new DatabaseError('Error finding record', error);
    }
  }

  async count(options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.count(options);
      const duration = Date.now() - start;

      LoggingService.logDatabaseQuery('count', duration);
      return result;
    } catch (error) {
      LoggingService.error('Error counting records', { options, error: error.message });
      throw new DatabaseError('Error counting records', error);
    }
  }

  async paginate(page = 1, limit = 10, options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.paginate(page, limit, options);
      const duration = Date.now() - start;

      LoggingService.logDatabaseQuery('paginate', duration);
      return result;
    } catch (error) {
      LoggingService.error('Error paginating records', { page, limit, options, error: error.message });
      throw new DatabaseError('Error paginating records', error);
    }
  }

  async bulkCreate(data, options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.bulkCreate(data, options);
      const duration = Date.now() - start;

      LoggingService.logDatabaseQuery('bulkCreate', duration);
      return result;
    } catch (error) {
      LoggingService.error('Error bulk creating records', { data, error: error.message });
      throw new DatabaseError('Error bulk creating records', error);
    }
  }

  async bulkUpdate(data, options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.bulkUpdate(data, options);
      const duration = Date.now() - start;

      LoggingService.logDatabaseQuery('bulkUpdate', duration);
      return result;
    } catch (error) {
      LoggingService.error('Error bulk updating records', { data, error: error.message });
      throw new DatabaseError('Error bulk updating records', error);
    }
  }

  async findOrCreate(where, defaults = {}, options = {}) {
    try {
      const start = Date.now();
      const result = await this.repository.findOrCreate(where, defaults, options);
      const duration = Date.now() - start;

      LoggingService.logDatabaseQuery('findOrCreate', duration);
      return result;
    } catch (error) {
      LoggingService.error('Error finding or creating record', { where, defaults, error: error.message });
      throw new DatabaseError('Error finding or creating record', error);
    }
  }

  async search(options = {}) {
    try {
      const { query, fields, page = 1, limit = 10 } = options;
      const where = {};

      if (query && fields) {
        where[Op.or] = fields.map(field => ({
          [field]: {
            [Op.like]: `%${query}%`
          }
        }));
      }

      return this.paginate(page, limit, { where });
    } catch (error) {
      LoggingService.error('Error searching records', { options, error: error.message });
      throw new DatabaseError('Error searching records', error);
    }
  }

  async validate(data, schema) {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      LoggingService.error('Validation error', { data, error: error.message });
      throw new ValidationError('Validation failed', error);
    }
  }

  async cache(key, ttl, fn) {
    try {
      return await CacheService.remember(key, ttl, fn);
    } catch (error) {
      LoggingService.error('Cache error', { key, error: error.message });
      return fn();
    }
  }

  async invalidateCache(key) {
    try {
      await CacheService.del(key);
    } catch (error) {
      LoggingService.error('Cache invalidation error', { key, error: error.message });
    }
  }
} 
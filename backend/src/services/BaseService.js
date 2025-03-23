import { LoggingService } from './LoggingService.js';
import { CacheService } from './CacheService.js';
import { ValidationError, DatabaseError, NotFoundError, ConflictError } from '../utils/errors.js';

/**
 * Clase base para todos los servicios
 * Implementa la lógica de negocio genérica y manejo de errores
 */
export class BaseService {
  constructor(repository) {
    if (!repository) {
      throw new Error('Repository is required for BaseService');
    }
    this.repository = repository;
  }

  /**
   * Obtiene todas las entidades con paginación
   * @param {Object} query - Parámetros de consulta
   * @param {Number} page - Número de página
   * @param {Number} limit - Límite de resultados por página
   * @returns {Promise<Object>} - Datos y metadatos de paginación
   */
  async getAll(query = {}, page = 1, limit = 10) {
    try {
      const options = this._buildQueryOptions(query);
      return await this.repository.findAll(options, page, limit);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Obtiene una entidad por ID
   * @param {String|Number} id - ID de la entidad
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Entidad encontrada
   * @throws {NotFoundError} - Si no se encuentra la entidad
   */
  async getById(id, options = {}) {
    try {
      const item = await this.repository.findById(id, options);
      if (!item) {
        throw new NotFoundError(`Entity with ID ${id} not found`);
      }
      return item;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Crea una nueva entidad
   * @param {Object} data - Datos para crear
   * @returns {Promise<Object>} - Entidad creada
   */
  async create(data) {
    try {
      this._validateCreate(data);
      const item = await this.repository.create(data);
      return item;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Actualiza una entidad existente
   * @param {String|Number} id - ID de la entidad
   * @param {Object} data - Datos para actualizar
   * @returns {Promise<Object>} - Entidad actualizada
   * @throws {NotFoundError} - Si no se encuentra la entidad
   */
  async update(id, data) {
    try {
      this._validateUpdate(id, data);
      const updated = await this.repository.update(id, data);
      if (!updated) {
        throw new NotFoundError(`Entity with ID ${id} not found`);
      }
      return updated;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Elimina una entidad
   * @param {String|Number} id - ID de la entidad
   * @returns {Promise<Boolean>} - true si se eliminó, false si no
   * @throws {NotFoundError} - Si no se encuentra la entidad
   */
  async delete(id) {
    try {
      const result = await this.repository.delete(id);
      if (!result) {
        throw new NotFoundError(`Entity with ID ${id} not found`);
      }
      return true;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Método para construir opciones de búsqueda
   * @param {Object} query - Parámetros de consulta
   * @returns {Object} - Opciones formateadas para el repositorio
   * @protected
   */
  _buildQueryOptions(query) {
    // Los servicios específicos pueden sobrescribir este método
    return { where: query };
  }

  /**
   * Validación para creación de entidad
   * @param {Object} data - Datos a validar
   * @throws {ValidationError} - Si hay errores de validación
   * @protected
   */
  _validateCreate(data) {
    // Los servicios específicos pueden sobrescribir este método
    // Implementación por defecto: no hace nada
  }

  /**
   * Validación para actualización de entidad
   * @param {String|Number} id - ID de la entidad
   * @param {Object} data - Datos a validar
   * @throws {ValidationError} - Si hay errores de validación
   * @protected
   */
  _validateUpdate(id, data) {
    // Los servicios específicos pueden sobrescribir este método
    // Implementación por defecto: no hace nada
  }

  /**
   * Manejo central de errores del servicio
   * @param {Error} error - Error capturado
   * @throws {Error} - Error procesado
   * @protected
   */
  _handleError(error) {
    if (error.name === 'SequelizeValidationError' || 
        error.name === 'SequelizeUniqueConstraintError') {
      throw new ValidationError(error.message, error.errors);
    }

    // Re-lanzar errores conocidos
    if (error instanceof ValidationError || 
        error instanceof NotFoundError || 
        error instanceof ConflictError) {
      throw error;
    }

    // Errores no controlados
    console.error('Service error:', error);
    throw error;
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
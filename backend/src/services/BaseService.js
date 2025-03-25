import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { ValidationError, DatabaseError, NotFoundError, ConflictError } from '../utils/errors.js';


/**
 * Clase base para todos los servicios
 * Implementa la lógica de negocio genérica y manejo de errores
 */
export class BaseService {
  /**
   * Constructor del servicio base
   * @param {Object} model - Modelo a utilizar (opcional)
   */
  constructor(model = null) {
    this.model = model;
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
      return await this.model.findMany(options);
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
      const item = await this.model.findUnique({
        where: { id }
      });
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
      return await this.model.create({
        data
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError(`Ya existe un registro con estos datos: ${error.meta?.target?.[0]}`);
        }
      }
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
      return await this.model.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('Registro no encontrado');
        }
        if (error.code === 'P2002') {
          throw new ConflictError(`Ya existe un registro con estos datos: ${error.meta?.target?.[0]}`);
        }
      }
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
      return await this.model.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('Registro no encontrado');
        }
      }
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ValidationError('Validation error', [{
          path: error.meta?.target?.[0],
          message: `Ya existe un registro con este ${error.meta?.target?.[0]}`
        }]);
      } else if (error.code === 'P2025') {
        throw new NotFoundError('Registro no encontrado');
      }
    }

    // Re-lanzar errores conocidos
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ConflictError
    ) {
      throw error;
    }

    // Errores no controlados
    console.error('Service error:', error);
    throw error;
  }

  async findOne(options = {}) {
    try {
      const start = Date.now();
      const result = await this.model.findUnique(options);
      const duration = Date.now() - start;

      logger.logDatabaseQuery('findOne', duration);
      return result;
    } catch (error) {
      logger.error('Error finding record', { options, error: error.message });
      throw new DatabaseError('Error finding record', error);
    }
  }

  async count(options = {}) {
    try {
      const start = Date.now();
      const result = await this.model.count(options);
      const duration = Date.now() - start;

      logger.logDatabaseQuery('count', duration);
      return result;
    } catch (error) {
      logger.error('Error counting records', { options, error: error.message });
      throw new DatabaseError('Error counting records', error);
    }
  }

  async paginate(page = 1, limit = 10, options = {}) {
    try {
      const start = Date.now();
      const result = await this.model.findMany(options);
      const duration = Date.now() - start;

      logger.logDatabaseQuery('paginate', duration);
      return result;
    } catch (error) {
      logger.error('Error paginating records', {
        page,
        limit,
        options,
        error: error.message,
      });
      throw new DatabaseError('Error paginating records', error);
    }
  }

  async bulkCreate(data, options = {}) {
    try {
      const start = Date.now();
      const result = await this.model.createMany(data);
      const duration = Date.now() - start;

      logger.logDatabaseQuery('bulkCreate', duration);
      return result;
    } catch (error) {
      logger.error('Error bulk creating records', { data, error: error.message });
      throw new DatabaseError('Error bulk creating records', error);
    }
  }

  async bulkUpdate(data, options = {}) {
    try {
      const start = Date.now();
      const result = await this.model.updateMany(data);
      const duration = Date.now() - start;

      logger.logDatabaseQuery('bulkUpdate', duration);
      return result;
    } catch (error) {
      logger.error('Error bulk updating records', { data, error: error.message });
      throw new DatabaseError('Error bulk updating records', error);
    }
  }

  async findOrCreate(where, defaults = {}, options = {}) {
    try {
      const start = Date.now();
      const result = await this.model.findUnique(where);
      const duration = Date.now() - start;

      logger.logDatabaseQuery('findOrCreate', duration);
      return result;
    } catch (error) {
      logger.error('Error finding or creating record', {
        where,
        defaults,
        error: error.message,
      });
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
            [Op.like]: `%${query}%`,
          },
        }));
      }

      return this.paginate(page, limit, { where });
    } catch (error) {
      logger.error('Error searching records', { options, error: error.message });
      throw new DatabaseError('Error searching records', error);
    }
  }

  async validate(data, schema) {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      logger.error('Validation error', { data, error: error.message });
      throw new ValidationError('Validation failed', error);
    }
  }

  async cache(key, ttl, fn) {
    try {
      return await CacheService.remember(key, ttl, fn);
    } catch (error) {
      logger.error('Cache error', { key, error: error.message });
      return fn();
    }
  }

  async invalidateCache(key) {
    try {
      await CacheService.del(key);
    } catch (error) {
      logger.error('Cache invalidation error', { key, error: error.message });
    }
  }

  async softDelete(id) {
    try {
      return await this.model.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Registro no encontrado');
        }
      }
      logger.error(`Error soft deleting ${this.model.name}:`, error);
      throw error;
    }
  }

  async restore(id) {
    try {
      return await this.model.update({
        where: { id },
        data: { deletedAt: null }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Registro no encontrado');
        }
      }
      logger.error(`Error restoring ${this.model.name}:`, error);
      throw error;
    }
  }
}

import { Op } from 'sequelize';

/**
 * Repositorio Base para operaciones comunes con la base de datos
 * Sirve como base para todos los repositorios específicos
 */
export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Encuentra todas las entidades con paginación opcional
   * @param {Object} options - Opciones de consulta (where, include, etc.)
   * @param {Number} page - Número de página (comienza en 1)
   * @param {Number} limit - Límite de resultados por página
   * @returns {Promise<Object>} - Objeto con datos y metadatos de paginación
   */
  async findAll(options = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { count, rows } = await this.model.findAndCountAll({
      ...options,
      offset,
      limit,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Encuentra una entidad por su ID
   * @param {String|Number} id - ID de la entidad
   * @param {Object} options - Opciones adicionales (include, attributes, etc)
   * @returns {Promise<Object>} - Entidad encontrada
   */
  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  /**
   * Encuentra una entidad por criterios específicos
   * @param {Object} criteria - Criterios de búsqueda (where)
   * @param {Object} options - Opciones adicionales (include, attributes, etc)
   * @returns {Promise<Object>} - Entidad encontrada
   */
  async findOne(criteria, options = {}) {
    return this.model.findOne({
      ...options,
      where: criteria,
    });
  }

  /**
   * Crea una nueva entidad
   * @param {Object} data - Datos para crear la entidad
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Entidad creada
   */
  async create(data, options = {}) {
    return this.model.create(data, options);
  }

  /**
   * Actualiza una entidad
   * @param {String|Number} id - ID de la entidad a actualizar
   * @param {Object} data - Datos para actualizar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Entidad actualizada
   */
  async update(id, data, options = {}) {
    const entity = await this.findById(id);
    if (!entity) return null;

    return entity.update(data, options);
  }

  /**
   * Elimina una entidad (o soft delete si el modelo tiene paranoid=true)
   * @param {String|Number} id - ID de la entidad a eliminar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Boolean>} - true si se eliminó, false si no
   */
  async delete(id, options = {}) {
    const entity = await this.findById(id);
    if (!entity) return false;

    await entity.destroy(options);
    return true;
  }

  /**
   * Elimina permanentemente una entidad (incluso con paranoid=true)
   * @param {String|Number} id - ID de la entidad a eliminar
   * @returns {Promise<Boolean>} - true si se eliminó, false si no
   */
  async forceDelete(id) {
    const entity = await this.findById(id);
    if (!entity) return false;

    await entity.destroy({ force: true });
    return true;
  }

  /**
   * Restaura una entidad eliminada con soft delete
   * @param {String|Number} id - ID de la entidad a restaurar
   * @returns {Promise<Object>} - Entidad restaurada o null
   */
  async restore(id) {
    const entity = await this.model.findByPk(id, { paranoid: false });
    if (!entity || !entity.deletedAt) return null;

    return entity.restore();
  }

  /**
   * Cuenta entidades basado en criterios
   * @param {Object} criteria - Criterios para contar (where)
   * @returns {Promise<Number>} - Total de entidades que cumplen los criterios
   */
  async count(criteria = {}) {
    return this.model.count({ where: criteria });
  }

  /**
   * Crea múltiples entidades en una sola transacción
   * @param {Array} dataArray - Array de objetos con datos para crear
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} - Array de entidades creadas
   */
  async bulkCreate(dataArray, options = {}) {
    return this.model.bulkCreate(dataArray, options);
  }

  async bulkUpdate(data, options = {}) {
    return this.model.bulkCreate(data, {
      ...options,
      updateOnDuplicate: true,
    });
  }

  async findOrCreate(where, defaults = {}, options = {}) {
    return this.model.findOrCreate({
      where: {
        ...where,
        deletedAt: null,
      },
      defaults,
      ...options,
    });
  }

  async paginate(page = 1, limit = 10, options = {}) {
    const offset = (page - 1) * limit;
    const { count, rows } = await this.model.findAndCountAll({
      ...options,
      where: {
        ...options.where,
        deletedAt: null,
      },
      limit,
      offset,
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

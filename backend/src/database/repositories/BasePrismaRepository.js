/**
 * Repositorio Base para operaciones con Prisma
 * Proporciona métodos CRUD genéricos para cualquier modelo de Prisma
 */
import prisma from '../prisma.js';

export class BasePrismaRepository {
  /**
   * Constructor del repositorio
   * @param {String} model - Nombre del modelo de Prisma a usar 
   */
  constructor(model) {
    if (!model) {
      throw new Error('Model name is required for BasePrismaRepository');
    }
    this.model = model;
    this.prisma = prisma;
  }

  /**
   * Encuentra todas las entidades con paginación opcional
   * @param {Object} options - Opciones de consulta (where, include, etc.)
   * @param {Number} page - Número de página (comienza en 1)
   * @param {Number} limit - Límite de resultados por página
   * @returns {Promise<Object>} - Objeto con datos y metadatos de paginación
   */
  async findAll(options = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    // Contar total de registros para paginación
    const totalPromise = this.prisma[this.model].count({
      where: options.where
    });
    
    // Obtener los datos con paginación
    const dataPromise = this.prisma[this.model].findMany({
      ...options,
      skip,
      take: limit
    });
    
    // Ejecutar ambas promesas en paralelo
    const [total, data] = await Promise.all([totalPromise, dataPromise]);
    
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Encuentra una entidad por su ID
   * @param {String|Number} id - ID de la entidad
   * @param {Object} options - Opciones adicionales (include, select, etc)
   * @returns {Promise<Object>} - Entidad encontrada
   */
  async findById(id, options = {}) {
    return this.prisma[this.model].findUnique({
      ...options,
      where: { 
        id,
        ...options.where
      }
    });
  }

  /**
   * Encuentra una entidad por criterios específicos
   * @param {Object} where - Criterios de búsqueda
   * @param {Object} options - Opciones adicionales (include, select, etc) 
   * @returns {Promise<Object>} - Entidad encontrada
   */
  async findOne(where, options = {}) {
    return this.prisma[this.model].findFirst({
      ...options,
      where
    });
  }

  /**
   * Crea una nueva entidad
   * @param {Object} data - Datos para crear la entidad
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Entidad creada
   */
  async create(data, options = {}) {
    return this.prisma[this.model].create({
      data,
      ...options
    });
  }

  /**
   * Actualiza una entidad
   * @param {String|Number} id - ID de la entidad a actualizar
   * @param {Object} data - Datos para actualizar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Entidad actualizada
   */
  async update(id, data, options = {}) {
    return this.prisma[this.model].update({
      where: { id },
      data,
      ...options
    });
  }

  /**
   * Elimina una entidad (soft delete si se configura en el modelo)
   * @param {String|Number} id - ID de la entidad a eliminar 
   * @returns {Promise<Boolean>} - true si se eliminó
   */
  async delete(id) {
    // Verificar si el modelo tiene campo deletedAt para soft delete
    const modelInfo = Reflect.ownKeys(this.prisma[this.model].fields || {});
    
    if (modelInfo.includes('deletedAt')) {
      // Soft delete
      await this.prisma[this.model].update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    } else {
      // Hard delete
      await this.prisma[this.model].delete({
        where: { id }
      });
    }
    
    return true;
  }

  /**
   * Elimina permanentemente una entidad
   * @param {String|Number} id - ID de la entidad a eliminar
   * @returns {Promise<Boolean>} - true si se eliminó
   */
  async forceDelete(id) {
    await this.prisma[this.model].delete({
      where: { id }
    });
    
    return true;
  }

  /**
   * Cuenta entidades basado en criterios
   * @param {Object} where - Criterios para contar
   * @returns {Promise<Number>} - Total de entidades que cumplen los criterios
   */
  async count(where = {}) {
    return this.prisma[this.model].count({ where });
  }

  /**
   * Crea múltiples entidades en una sola transacción
   * @param {Array} dataArray - Array de objetos con datos para crear
   * @returns {Promise<Array>} - Array de entidades creadas
   */
  async bulkCreate(dataArray) {
    const createdItems = [];
    
    await this.prisma.$transaction(async (tx) => {
      for (const data of dataArray) {
        const item = await tx[this.model].create({ data });
        createdItems.push(item);
      }
    });
    
    return createdItems;
  }
} 
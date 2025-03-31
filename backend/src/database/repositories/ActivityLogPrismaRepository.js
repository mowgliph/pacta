/**
 * Repositorio para operaciones con Registros de Actividad usando Prisma
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class ActivityLogPrismaRepository extends BasePrismaRepository {
  constructor() {
    super('activityLog');
  }

  /**
   * Registra una nueva actividad
   * @param {Object} data - Datos de la actividad
   * @returns {Promise<Object>} - Actividad registrada
   */
  async logActivity(data) {
    return this.create({
      ...data,
      timestamp: data.timestamp || new Date()
    });
  }

  /**
   * Obtiene actividades por usuario
   * @param {String} userId - ID del usuario
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} - Actividades del usuario
   */
  async getByUser(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    return this.findAll({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    }, page, limit);
  }

  /**
   * Obtiene actividades por tipo de acción
   * @param {String} action - Tipo de acción
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} - Actividades del tipo especificado
   */
  async getByAction(action, options = {}) {
    const { page = 1, limit = 10 } = options;
    return this.findAll({
      where: { action },
      orderBy: { timestamp: 'desc' }
    }, page, limit);
  }

  /**
   * Obtiene actividades relacionadas con una entidad
   * @param {String} entityType - Tipo de entidad
   * @param {String} entityId - ID de la entidad
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} - Actividades relacionadas con la entidad
   */
  async getByEntity(entityType, entityId, options = {}) {
    const { page = 1, limit = 10 } = options;
    return this.findAll({
      where: { 
        entityType,
        entityId
      },
      orderBy: { timestamp: 'desc' }
    }, page, limit);
  }

  /**
   * Busca actividades en un rango de fechas
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} - Actividades en el rango de fechas
   */
  async getByDateRange(startDate, endDate, options = {}) {
    const { page = 1, limit = 10 } = options;
    return this.findAll({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate || new Date()
        }
      },
      orderBy: { timestamp: 'desc' }
    }, page, limit);
  }
}

// Crear y exportar instancia por defecto
const activityLogPrismaRepository = new ActivityLogPrismaRepository();
export default activityLogPrismaRepository; 
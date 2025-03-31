/**
 * Repositorio para operaciones con Reportes usando Prisma
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class ReportPrismaRepository extends BasePrismaRepository {
  constructor() {
    super('report');
  }

  /**
   * Crea un nuevo reporte con metadatos
   * @param {Object} data - Datos del reporte
   * @returns {Promise<Object>} - Reporte creado
   */
  async createReport(data) {
    return this.create({
      ...data,
      generatedAt: data.generatedAt || new Date(),
      status: data.status || 'COMPLETED'
    });
  }

  /**
   * Obtiene reportes por tipo
   * @param {String} type - Tipo de reporte
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} - Reportes del tipo especificado
   */
  async getByType(type, options = {}) {
    const { page = 1, limit = 10 } = options;
    return this.findAll({
      where: { type },
      orderBy: { generatedAt: 'desc' }
    }, page, limit);
  }

  /**
   * Obtiene reportes por usuario
   * @param {String} userId - ID del usuario
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} - Reportes generados por el usuario
   */
  async getByUser(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    return this.findAll({
      where: { userId },
      orderBy: { generatedAt: 'desc' }
    }, page, limit);
  }

  /**
   * Marca un reporte como descargado
   * @param {String} id - ID del reporte
   * @returns {Promise<Object>} - Reporte actualizado
   */
  async markAsDownloaded(id) {
    return this.update(id, {
      downloadCount: {
        increment: 1
      },
      lastDownloadedAt: new Date()
    });
  }

  /**
   * Obtiene los reportes más recientes
   * @param {Number} limit - Número máximo de reportes a obtener
   * @returns {Promise<Array>} - Reportes más recientes
   */
  async getRecent(limit = 5) {
    return this.prisma.report.findMany({
      take: limit,
      orderBy: { generatedAt: 'desc' }
    });
  }
}

// Crear y exportar instancia por defecto
const reportPrismaRepository = new ReportPrismaRepository();
export default reportPrismaRepository; 
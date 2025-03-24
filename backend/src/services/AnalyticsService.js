/**
 * Servicio para estadísticas y análisis de datos
 */
import { prisma } from '../database/prisma.js';
import { CacheService } from './CacheService.js';
import { BaseService } from './BaseService.js';

// Tiempo de cache para estadísticas (10 minutos)
const STATS_CACHE_TTL = 10 * 60;

export class AnalyticsService extends BaseService {
  constructor() {
    super();
    this.cache = new CacheService('analytics');
  }

  /**
   * Obtiene estadísticas generales del sistema
   */
  async getSystemStats() {
    const cacheKey = 'system_stats';

    // Intentar obtener desde caché
    const cachedStats = this.cache.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    try {
      // Contar usuarios, contratos, empresas, etc.
      const [
        usersCount,
        contractsCount,
        companiesCount,
        activeContractsCount,
        expiringContractsCount,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.contract.count(),
        prisma.company.count(),
        prisma.contract.count({
          where: { status: 'ACTIVE' },
        }),
        prisma.contract.count({
          where: {
            expirationDate: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
              gte: new Date(),
            },
          },
        }),
      ]);

      const stats = {
        usersCount,
        contractsCount,
        companiesCount,
        activeContractsCount,
        expiringContractsCount,
        lastUpdated: new Date().toISOString(),
      };

      // Guardar en caché
      this.cache.set(cacheKey, stats, STATS_CACHE_TTL);

      return stats;
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas del sistema', error);
      throw new Error('Error obteniendo estadísticas del sistema');
    }
  }

  /**
   * Obtiene estadísticas de contratos
   */
  async getContractStats() {
    const cacheKey = 'contract_stats';

    // Intentar obtener desde caché
    const cachedStats = this.cache.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    try {
      // Estadísticas por estado
      const statusCounts = await prisma.contract.groupBy({
        by: ['status'],
        _count: true,
      });

      // Estadísticas por tipo
      const typeCounts = await prisma.contract.groupBy({
        by: ['type'],
        _count: true,
      });

      // Contratos por mes (últimos 12 meses)
      const now = new Date();
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

      const contractsByMonth = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "Contract"
        WHERE "createdAt" >= ${oneYearAgo}
        GROUP BY month
        ORDER BY month ASC
      `;

      const stats = {
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
        byType: typeCounts.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {}),
        byMonth: contractsByMonth,
        lastUpdated: new Date().toISOString(),
      };

      // Guardar en caché
      this.cache.set(cacheKey, stats, STATS_CACHE_TTL);

      return stats;
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas de contratos', error);
      throw new Error('Error obteniendo estadísticas de contratos');
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStats() {
    const cacheKey = 'user_stats';

    // Intentar obtener desde caché
    const cachedStats = this.cache.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    try {
      // Estadísticas por rol
      const roleCounts = await prisma.user.groupBy({
        by: ['role'],
        _count: true,
      });

      // Usuarios activos vs inactivos
      const activeCount = await prisma.user.count({
        where: { active: true },
      });

      const inactiveCount = await prisma.user.count({
        where: { active: false },
      });

      // Usuarios por mes (últimos 12 meses)
      const now = new Date();
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

      const usersByMonth = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${oneYearAgo}
        GROUP BY month
        ORDER BY month ASC
      `;

      const stats = {
        byRole: roleCounts.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {}),
        active: activeCount,
        inactive: inactiveCount,
        byMonth: usersByMonth,
        lastUpdated: new Date().toISOString(),
      };

      // Guardar en caché
      this.cache.set(cacheKey, stats, STATS_CACHE_TTL);

      return stats;
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas de usuarios', error);
      throw new Error('Error obteniendo estadísticas de usuarios');
    }
  }

  /**
   * Invalida caché de estadísticas
   */
  invalidateCache() {
    this.cache.del('system_stats');
    this.cache.del('contract_stats');
    this.cache.del('user_stats');
    this.logger.info('Caché de estadísticas invalidada');
  }
}

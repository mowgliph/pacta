const { prisma } = require("./prisma.cjs");
const { AppError } = require("./error-handler.cjs");
const { 
  STATISTICS_QUERIES, 
  DASHBOARD_QUERIES, 
  CONTRACT_QUERIES,
  STATS_QUERIES,
  LAST_MONTH_QUERIES 
} = require('./sql-queries.cjs');

// Códigos de error estandarizados
const ERROR_CODES = {
  DB_CONNECTION: 'DATABASE_ERROR',
  INVALID_DATA: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  UNKNOWN: 'INTERNAL_SERVER_ERROR'
};

exports.QueryOptimizer = class QueryOptimizer {
  /**
   * Obtiene la fecha actual en formato UTC con la hora establecida a medianoche (00:00:00.000)
   * @returns {Date} Fecha actual en UTC
   */
  getTodayUTC() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  /**
   * Obtiene la fecha de hoy más 30 días en formato UTC con la hora establecida a un instante antes de medianoche (23:59:59.999)
   * @returns {Date} Fecha de hoy + 30 días en UTC
   */
  getThirtyDaysLaterUTC() {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 30);
    date.setUTCHours(23, 59, 59, 999);
    return date;
  }

  /**
   * Maneja los errores de manera estandarizada
   * @param {Error} error - Error original
   * @param {string} context - Contexto donde ocurrió el error
   * @param {string} code - Código de error estandarizado
   * @param {Object} [metadata] - Metadatos adicionales para el error
   * @throws {AppError} Error estandarizado
   */
  handleError(error, context, code = ERROR_CODES.UNKNOWN, metadata = {}) {
    const errorMessage = `Error en ${context}: ${error.message}`;
    const errorContext = `[QueryOptimizer] ${errorMessage}`;
    
    // Mapear códigos de error a los métodos correspondientes de AppError
    const errorMap = {
      [ERROR_CODES.DB_CONNECTION]: () => 
        AppError.database(errorContext, code, { ...metadata, originalError: error.message }),
      [ERROR_CODES.INVALID_DATA]: () =>
        AppError.validation(errorContext, code, { ...metadata, originalError: error.message }),
      [ERROR_CODES.NOT_FOUND]: () =>
        AppError.notFound(errorContext, code, { ...metadata, originalError: error.message }),
      [ERROR_CODES.VALIDATION]: () =>
        AppError.validation(errorContext, code, { ...metadata, originalError: error.message }),
      [ERROR_CODES.UNKNOWN]: () =>
        AppError.internal(errorContext, code, { ...metadata, originalError: error.message })
    };
    
    const errorHandler = errorMap[code] || errorMap[ERROR_CODES.UNKNOWN];
    throw errorHandler();
  }

  /**
   * Obtiene las estadísticas generales del dashboard
   * @returns {Promise<Object>} Objeto con las estadísticas del dashboard
   */
  async getDashboardStatistics() {
    // Usar fechas UTC para consistencia
    const today = this.getTodayUTC();
    const thirtyDaysLater = this.getThirtyDaysLaterUTC();

    try {
      // Verificar conexión con la base de datos
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        this.handleError(error, 'verificar conexión con la base de datos', ERROR_CODES.DB_CONNECTION);
      }
      
      // Obtener estadísticas y actividad reciente en paralelo
      const [dashboardStats, recentActivity] = await Promise.all([
        prisma.$queryRawUnsafe(DASHBOARD_QUERIES.GET_DASHBOARD_STATS, today, thirtyDaysLater),
        prisma.$queryRawUnsafe(DASHBOARD_QUERIES.GET_RECENT_ACTIVITY)
      ]);

      // Extraer los resultados
      const stats = dashboardStats[0] || {};
      
      // Preparar estadísticas actuales
      const currentStats = {
        total: Number(stats.total) || 0,
        active: Number(stats.active) || 0,
        expiring: Number(stats.expiring) || 0,
        expired: Number(stats.expired) || 0,
        client: Number(stats.client) || 0,
        supplier: Number(stats.supplier) || 0,
        recentActivity: recentActivity || []
      };

      // Validar que todos los campos requeridos estén presentes
      for (const [key, value] of Object.entries(currentStats)) {
        if (value === undefined || (Array.isArray(value) && key !== 'recentActivity')) {
          const error = new Error(`Dato inválido o faltante para: ${key}`);
          this.handleError(error, 'validar estadísticas del dashboard', ERROR_CODES.INVALID_DATA, { key, value });
        }
      }

      // Obtener estadísticas del mes anterior
      let lastMonthStats;
      try {
        lastMonthStats = await this.getDashboardStatisticsLastMonth();
      } catch (error) {
        this.handleError(
          error, 
          'obtener estadísticas del mes anterior', 
          ERROR_CODES.DB_CONNECTION,
          { action: 'usando valores actuales como respaldo' }
        );
        // Usar valores actuales como respaldo para mostrar tendencia plana
        lastMonthStats = {
          total: currentStats.total,
          activeClients: currentStats.client,
          activeSuppliers: currentStats.supplier,
          activeContracts: currentStats.active,
          expiring: currentStats.expiring,
          expired: currentStats.expired
        };
      }

      // Función auxiliar para calcular tendencias
      const calculateTrend = (current, previous = 0) => {
        if (previous === 0) return { 
          value: 100, 
          label: 'sin datos previos', 
          positive: true 
        };
        const change = ((current - previous) / previous) * 100;
        return {
          value: Math.round(Math.abs(change)),
          label: 'vs mes anterior',
          positive: change >= 0
        };
      };

      // Preparar el resultado final
      return {
        totals: {
          total: currentStats.total,
          active: currentStats.active,
          expiring: currentStats.expiring,
          expired: currentStats.expired,
          client: currentStats.client,
          supplier: currentStats.supplier,
          recentActivity: currentStats.recentActivity
        },
        trends: {
          total: calculateTrend(currentStats.total, lastMonthStats.total),
          active: calculateTrend(currentStats.active, lastMonthStats.activeContracts),
          expiring: calculateTrend(currentStats.expiring, lastMonthStats.expiring),
          expired: calculateTrend(currentStats.expired, lastMonthStats.expired),
          client: calculateTrend(currentStats.client, lastMonthStats.activeClients),
          supplier: calculateTrend(currentStats.supplier, lastMonthStats.activeSuppliers)
        },
        distribution: {
          client: currentStats.client,
          supplier: currentStats.supplier
        },
        recentActivity: currentStats.recentActivity,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      this.handleError(error, 'obtener estadísticas del dashboard', ERROR_CODES.UNKNOWN);
    }
  }

  /**
   * Obtiene el primer y último día del mes anterior en formato UTC
   * @returns {Object} Objeto con firstDay y lastDay del mes anterior en UTC
   */
  getLastMonthUTCRange() {
    const now = new Date();
    const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
    
    return { firstDay, lastDay };
  }

  /**
   * Calcula las estadísticas del dashboard para el mes anterior, usando la misma lógica de negocio que el dashboard actual.
   * @returns {Promise<Object>} Totales del mes anterior.
   */
  async getDashboardStatisticsLastMonth() {
    try {
      const { firstDay: firstDayOfLastMonth, lastDay: lastDayOfLastMonth } = this.getLastMonthUTCRange();
      
      // Obtener consultas SQL con sus parámetros
      const activeClientsQuery = LAST_MONTH_QUERIES.GET_ACTIVE_CLIENTS_LAST_MONTH(lastDayOfLastMonth);
      const activeSuppliersQuery = LAST_MONTH_QUERIES.GET_ACTIVE_SUPPLIERS_LAST_MONTH(lastDayOfLastMonth);
      const activeContractsQuery = LAST_MONTH_QUERIES.GET_ACTIVE_CONTRACTS_LAST_MONTH(lastDayOfLastMonth);
      const expiringQuery = LAST_MONTH_QUERIES.GET_EXPIRING_LAST_MONTH(firstDayOfLastMonth, lastDayOfLastMonth);
      const expiredQuery = LAST_MONTH_QUERIES.GET_EXPIRED_LAST_MONTH(lastDayOfLastMonth);

      // Ejecutar consultas en paralelo
      const [
        activeClientsResult,
        activeSuppliersResult,
        activeContractsResult,
        expiringResult,
        expiredResult
      ] = await Promise.all([
        prisma.$queryRawUnsafe(activeClientsQuery.query, ...activeClientsQuery.params),
        prisma.$queryRawUnsafe(activeSuppliersQuery.query, ...activeSuppliersQuery.params),
        prisma.$queryRawUnsafe(activeContractsQuery.query, ...activeContractsQuery.params),
        prisma.$queryRawUnsafe(expiringQuery.query, ...expiringQuery.params),
        prisma.$queryRawUnsafe(expiredQuery.query, ...expiredQuery.params)
      ]);

      // Extraer los resultados
      const activeClientsLastMonth = Number(activeClientsResult[0]?.count || 0);
      const activeSuppliersLastMonth = Number(activeSuppliersResult[0]?.count || 0);
      const activeContractsLastMonth = Number(activeContractsResult[0]?.count || 0);
      const expiringLastMonth = Number(expiringResult[0]?.count || 0);
      const expiredLastMonth = Number(expiredResult[0]?.count || 0);

      return {
        activeClients: activeClientsLastMonth,
        activeSuppliers: activeSuppliersLastMonth,
        activeContracts: activeContractsLastMonth,
        expiring: expiringLastMonth,
        expired: expiredLastMonth
      };
    } catch (error) {
      this.handleError(error, 'obtener estadísticas del mes anterior', ERROR_CODES.DB_CONNECTION);
    }
  }

  // Exportación de estadísticas
  async exportStatistics(type, filters) {
    try {
      const exportUtils = require('./export-utils');
      const stats = await this.getContractsStats(filters);
      return await exportUtils.exportStatisticsToPdf(type, stats);
    } catch (error) {
      this.handleError(error, 'exportar estadísticas', ERROR_CODES.UNKNOWN);
    }
  }

  /**
   * Obtiene estadísticas de contratos para exportación
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Object>} Estadísticas de contratos
   */
  async getContractsStats(filters = {}) {
    try {
      // Obtener consultas SQL con sus parámetros
      const { 
        query: statusQuery, 
        params: statusParams 
      } = STATS_QUERIES.GET_CONTRACTS_BY_STATUS(filters);
      
      const { 
        query: typeQuery, 
        params: typeParams 
      } = STATS_QUERIES.GET_CONTRACTS_BY_TYPE(filters);
      
      const { 
        query: monthQuery, 
        params: monthParams 
      } = STATS_QUERIES.GET_CONTRACTS_BY_MONTH(filters);

      // Ejecutar consultas en paralelo
      const [byStatus, byType, byMonth] = await Promise.all([
        prisma.$queryRawUnsafe(statusQuery, ...statusParams),
        prisma.$queryRawUnsafe(typeQuery, ...typeParams),
        prisma.$queryRawUnsafe(monthQuery, ...monthParams)
      ]);

      return {
        byStatus,
        byType,
        byMonth
      };
    } catch (error) {
      this.handleError(error, 'obtener estadísticas de contratos', ERROR_CODES.DB_CONNECTION, { filters });
    }
  }

  /**
   * Obtiene la distribución de contratos por estado
   * @returns {Promise<Array>} Lista de estados con conteo de contratos
   */
  async getContractsByStatus() {
    try {
      return await prisma.$queryRawUnsafe(STATISTICS_QUERIES.GET_CONTRACTS_BY_STATUS);
    } catch (error) {
      this.handleError(error, 'obtener distribución por estado', ERROR_CODES.DB_CONNECTION);
      return [];
    }
  }

  /**
   * Obtiene la distribución de contratos por tipo
   * @returns {Promise<Array>} Lista de tipos con conteo de contratos
   */
  async getContractsByType() {
    try {
      return await prisma.$queryRawUnsafe(STATISTICS_QUERIES.GET_CONTRACTS_BY_TYPE);
    } catch (error) {
      this.handleError(error, 'obtener distribución por tipo', ERROR_CODES.DB_CONNECTION);
      return [];
    }
  }

  /**
   * Obtiene la distribución de contratos por usuario
   * @returns {Promise<Array>} Lista de usuarios con conteo de contratos
   */
  async getContractsByUser() {
    try {
      return await prisma.$queryRawUnsafe(STATISTICS_QUERIES.GET_CONTRACTS_BY_USER);
    } catch (error) {
      this.handleError(error, 'obtener distribución por usuario', ERROR_CODES.DB_CONNECTION);
      return [];
    }
  }
  /**
   * Obtiene el conteo de contratos creados por mes
   * @returns {Promise<Array>} Lista de meses con conteo de contratos
   */
  async getContractsCreatedByMonth() {
    try {
      return await prisma.$queryRawUnsafe(STATISTICS_QUERIES.GET_CONTRACTS_BY_MONTH);
    } catch (error) {
      this.handleError(error, 'obtener contratos creados por mes', ERROR_CODES.DB_CONNECTION);
      return [];
    }
  }
  /**
   * Obtiene el conteo de contratos vencidos por mes
   * @returns {Promise<Array>} Lista de meses con conteo de contratos vencidos
   */
  async getContractsExpiredByMonth() {
    try {
      return await prisma.$queryRawUnsafe(STATISTICS_QUERIES.GET_EXPIRED_CONTRACTS_BY_MONTH);
    } catch (error) {
      this.handleError(error, 'obtener contratos vencidos por mes', ERROR_CODES.DB_CONNECTION);
      return [];
    }
  }
  /**
   * Obtiene la cantidad de suplementos por contrato
   * @returns {Promise<Array>} Lista de contratos con conteo de suplementos
   */
  async getSupplementsCountByContract() {
    try {
      return await prisma.$queryRawUnsafe(STATISTICS_QUERIES.GET_SUPPLEMENTS_BY_CONTRACT);
    } catch (error) {
      this.handleError(error, 'obtener suplementos por contrato', ERROR_CODES.DB_CONNECTION);
      return [];
    }
  }
  /**
   * Obtiene contratos próximos a vencer en los próximos 30 días
   * @param {Object} options - Opciones de paginación
   * @param {number} [options.skip=0] - Número de registros a omitir
   * @param {number} [options.take=10] - Número de registros a devolver
   * @returns {Promise<{data: Array, total: number}>} Lista de contratos y total de registros
   */
  async getContractsExpiringSoon({ skip = 0, take = 10 } = {}) {
    try {
      const now = new Date();
      const soon = new Date();
      soon.setDate(now.getDate() + 30);
      
      const skipNum = parseInt(skip, 10);
      const takeNum = Math.min(parseInt(take, 10), 100);
      
      const [totalResult, data] = await Promise.all([
        prisma.$queryRawUnsafe(CONTRACT_QUERIES.COUNT_EXPIRING_CONTRACTS, now, soon),
        prisma.$queryRawUnsafe(
          CONTRACT_QUERIES.GET_EXPIRING_CONTRACTS(takeNum, skipNum),
          now,
          soon
        )
      ]);
      
      return { 
        data, 
        total: totalResult[0]?.total || 0 
      };
    } catch (error) {
      this.handleError(error, 'obtener contratos próximos a vencer', ERROR_CODES.DB_CONNECTION);
      return { data: [], total: 0 };
    }
  }
  /**
   * Obtiene contratos sin documentos adjuntos
   * @param {Object} options - Opciones de paginación
   * @param {number} [options.skip=0] - Número de registros a omitir
   * @param {number} [options.take=10] - Número de registros a devolver
   * @returns {Promise<{data: Array, total: number}>} Lista de contratos y total de registros
   */
  async getContractsWithoutDocuments({ skip = 0, take = 10 } = {}) {
    try {
      const skipNum = parseInt(skip, 10);
      const takeNum = Math.min(parseInt(take, 10), 100);
      
      const [totalResult, data] = await Promise.all([
        prisma.$queryRawUnsafe(CONTRACT_QUERIES.COUNT_CONTRACTS_WITHOUT_DOCS),
        prisma.$queryRawUnsafe(
          CONTRACT_QUERIES.GET_CONTRACTS_WITHOUT_DOCS(takeNum, skipNum)
        )
      ]);
      
      return { 
        data, 
        total: totalResult[0]?.total || 0 
      };
    } catch (error) {
      this.handleError(error, 'obtener contratos sin documentos', ERROR_CODES.DB_CONNECTION);
      return { data: [], total: 0 };
    }
  }
  /**
   * Obtiene la actividad de los usuarios
   * @param {Object} options - Opciones de paginación
   * @param {number} [options.skip=0] - Número de registros a omitir
   * @param {number} [options.take=10] - Número de registros a devolver
   * @returns {Promise<{data: Array, total: number}>} Lista de usuarios y total de registros
   */
  async getUsersActivity({ skip = 0, take = 10 } = {}) {
    try {
      const skipNum = parseInt(skip, 10);
      const takeNum = Math.min(parseInt(take, 10), 100);
      
      // Obtener el total de usuarios con actividad
      const totalResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT userId) as total FROM HistoryRecord
      `;
      
      // Obtener los datos paginados
      const data = await prisma.$queryRawUnsafe(
        STATISTICS_QUERIES.GET_USERS_ACTIVITY(takeNum, skipNum)
      );
      
      return { 
        data, 
        total: totalResult[0]?.total || 0 
      };
    } catch (error) {
      this.handleError(error, 'obtener actividad de usuarios', ERROR_CODES.DB_CONNECTION);
      return { data: [], total: 0 };
    }
  }
};

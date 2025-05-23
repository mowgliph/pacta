const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");
const path = require("path");
const fs = require("fs").promises;
const { QueryOptimizer } = require("../utils/query-optimizer.cjs");

const EXPORTS_DIR = path.resolve(__dirname, "../../data/statistics/exports");

function registerStatisticsHandlers() {
  const eventManager = EventManager.getInstance();
  const optimizer = new QueryOptimizer();

  // Asegurar que existe el directorio de exportación
  fs.mkdir(EXPORTS_DIR, { recursive: true }).catch(console.error);

  const handlers = {
    [IPC_CHANNELS.STATISTICS.DASHBOARD]: async () => {
      try {
        return await optimizer.getDashboardStatistics();
      } catch (error) {
        throw AppError.internal(
          "Error al obtener estadísticas del dashboard",
          "DASHBOARD_ERROR",
          { originalError: error.message }
        );
      }
    },

    [IPC_CHANNELS.STATISTICS.CONTRACTS]: async (event, filters) => {
      try {
        return await optimizer.getContractsStats(filters);
      } catch (error) {
        throw AppError.internal(
          "Error al obtener estadísticas de contratos",
          "CONTRACTS_STATS_ERROR",
          { filters, originalError: error.message }
        );
      }
    },

    [IPC_CHANNELS.STATISTICS.EXPORT]: async (event, { type, filters }) => {
      if (!type) {
        throw AppError.validation(
          "Tipo de exportación requerido",
          "EXPORT_TYPE_REQUIRED"
        );
      }

      try {
        const data = await optimizer.exportStatistics(type, filters);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `stats_${type}_${timestamp}.json`;
        const filePath = path.join(EXPORTS_DIR, filename);

        await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        return { filename, path: filePath, data };
      } catch (error) {
        throw AppError.internal(
          "Error al exportar estadísticas",
          "EXPORT_ERROR",
          { type, filters, originalError: error.message }
        );
      }
    },

    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_STATUS]: async () => {
      try {
        return await optimizer.getContractsByStatus();
      } catch (error) {
        throw AppError.internal(
          "Error al obtener contratos por estado",
          "STATUS_STATS_ERROR",
          { originalError: error.message }
        );
      }
    },

    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_TYPE]: async () => {
      try {
        return await optimizer.getContractsByType();
      } catch (error) {
        throw AppError.internal(
          "Error al obtener contratos por tipo",
          "TYPE_STATS_ERROR",
          { originalError: error.message }
        );
      }
    },

    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_CURRENCY]: async () => {
      try {
        return await optimizer.getContractsByCurrency();
      } catch (error) {
        throw AppError.internal(
          "Error al obtener contratos por moneda",
          "CURRENCY_STATS_ERROR",
          { originalError: error.message }
        );
      }
    },
  };

  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerStatisticsHandlers,
};

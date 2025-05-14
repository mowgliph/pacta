const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const path = require("path");
const { QueryOptimizer } = require("../utils/query-optimizer.cjs");
const { withErrorHandling } = require("../utils/error-handler.cjs");

const EXPORTS_DIR = path.resolve(__dirname, "../../data/statistics/exports");

function registerStatisticsHandlers(eventManager) {
  const optimizer = new QueryOptimizer();
  const handlers = {
    [IPC_CHANNELS.STATISTICS.DASHBOARD]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.DASHBOARD,
      async (event) => {
        const data = await optimizer.getDashboardStatistics();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS,
      async (event, filters) => {
        const data = await optimizer.getContractsStats(filters);
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.EXPORT]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.EXPORT,
      async (event, type, filters) => {
        const data = await optimizer.exportStatistics(type, filters);
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_STATUS]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS_BY_STATUS,
      async () => {
        const data = await optimizer.getContractsByStatus();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_TYPE]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS_BY_TYPE,
      async () => {
        const data = await optimizer.getContractsByType();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_CURRENCY]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS_BY_CURRENCY,
      async () => {
        const data = await optimizer.getContractsByCurrency();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_USER]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS_BY_USER,
      async () => {
        const data = await optimizer.getContractsByUser();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS_CREATED_BY_MONTH]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS_CREATED_BY_MONTH,
      async () => {
        const data = await optimizer.getContractsCreatedByMonth();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRED_BY_MONTH]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRED_BY_MONTH,
      async () => {
        const data = await optimizer.getContractsExpiredByMonth();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.SUPPLEMENTS_COUNT_BY_CONTRACT]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.SUPPLEMENTS_COUNT_BY_CONTRACT,
      async () => {
        const data = await optimizer.getSupplementsCountByContract();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRING_SOON]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRING_SOON,
      async () => {
        const data = await optimizer.getContractsExpiringSoon();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.CONTRACTS_WITHOUT_DOCUMENTS]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.CONTRACTS_WITHOUT_DOCUMENTS,
      async () => {
        const data = await optimizer.getContractsWithoutDocuments();
        return { success: true, data };
      }
    ),
    [IPC_CHANNELS.STATISTICS.USERS_ACTIVITY]: withErrorHandling(
      IPC_CHANNELS.STATISTICS.USERS_ACTIVITY,
      async () => {
        const data = await optimizer.getUsersActivity();
        return { success: true, data };
      }
    ),
  };

  eventManager.registerHandlers(handlers);
}

module.exports = { registerStatisticsHandlers };

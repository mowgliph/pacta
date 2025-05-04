import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import path from 'path';
import { QueryOptimizer } from '../utils/query-optimizer';

const EXPORTS_DIR = path.resolve(__dirname, '../../data/statistics/exports');

export function registerStatisticsHandlers(eventManager: EventManager): void {
  const optimizer = new QueryOptimizer();
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.STATISTICS.DASHBOARD]: async (event) => {
      logger.info('Estadísticas del dashboard solicitadas');
      try {
        return await optimizer.getDashboardStatistics();
      } catch (error) {
        logger.error('Error en estadísticas dashboard:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.STATISTICS.CONTRACTS]: async (event, filters) => {
      logger.info('Estadísticas de contratos solicitadas', { filters });
      try {
        return await optimizer.getContractsStats(filters);
      } catch (error) {
        logger.error('Error en estadísticas de contratos:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.STATISTICS.EXPORT]: async (event, type, filters) => {
      logger.info('Exportación de estadísticas solicitada', { type, filters });
      try {
        return await optimizer.exportStatistics(type, filters);
      } catch (error) {
        logger.error('Error al exportar estadísticas:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_STATUS]: async () => {
      return optimizer.getContractsByStatus();
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_TYPE]: async () => {
      return optimizer.getContractsByType();
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_CURRENCY]: async () => {
      return optimizer.getContractsByCurrency();
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_USER]: async () => {
      return optimizer.getContractsByUser();
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_CREATED_BY_MONTH]: async () => {
      return optimizer.getContractsCreatedByMonth();
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRED_BY_MONTH]: async () => {
      return optimizer.getContractsExpiredByMonth();
    },
    [IPC_CHANNELS.STATISTICS.SUPPLEMENTS_COUNT_BY_CONTRACT]: async () => {
      return optimizer.getSupplementsCountByContract();
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRING_SOON]: async () => {
      return optimizer.getContractsExpiringSoon();
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_WITHOUT_DOCUMENTS]: async () => {
      return optimizer.getContractsWithoutDocuments();
    },
    [IPC_CHANNELS.STATISTICS.USERS_ACTIVITY]: async () => {
      return optimizer.getUsersActivity();
    },
  };

  eventManager.registerHandlers(handlers);
} 
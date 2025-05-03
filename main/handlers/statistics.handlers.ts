import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';
import fs from 'fs';
import path from 'path';

const EXPORTS_DIR = path.resolve(__dirname, '../../data/statistics/exports');

export function registerStatisticsHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.STATISTICS.DASHBOARD]: async (event) => {
      logger.info('Estadísticas del dashboard solicitadas');
      try {
        const [totalContracts, activeContracts, pendingDocuments, totalSupplements] = await Promise.all([
          prisma.contract.count(),
          prisma.contract.count({ where: { status: 'Vigente' } }),
          prisma.document.count({ where: { filePath: '' } }),
          prisma.supplement.count({ where: { isApproved: true } })
        ]);
        return {
          totalContracts,
          activeContracts,
          pendingDocuments,
          totalSupplements
        };
      } catch (error) {
        logger.error('Error en estadísticas dashboard:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.STATISTICS.CONTRACTS]: async (event, filters) => {
      logger.info('Estadísticas de contratos solicitadas', { filters });
      try {
        // Por estado
        const byStatus = await prisma.contract.groupBy({
          by: ['status'],
          _count: { _all: true },
        });
        // Por tipo
        const byType = await prisma.contract.groupBy({
          by: ['type'],
          _count: { _all: true },
        });
        // Por mes de creación (raw SQL)
        const byMonth = await prisma.$queryRawUnsafe(
          `SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count FROM Contract GROUP BY month ORDER BY month`
        );
        return {
          byStatus,
          byType,
          byMonth
        };
      } catch (error) {
        logger.error('Error en estadísticas de contratos:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.STATISTICS.EXPORT]: async (event, type, filters) => {
      logger.info('Exportación de estadísticas solicitada', { type, filters });
      try {
        fs.mkdirSync(EXPORTS_DIR, { recursive: true });
        const exportPath = path.join(EXPORTS_DIR, `estadisticas_${type}_${Date.now()}.pdf`);
        fs.writeFileSync(exportPath, Buffer.from('PDF simulado de estadísticas'));
        return { path: exportPath };
      } catch (error) {
        logger.error('Error al exportar estadísticas:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_STATUS]: async () => {
      // Distribución de contratos por estado
      return await prisma.contract.groupBy({ by: ['status'], _count: { _all: true } });
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_TYPE]: async () => {
      // Distribución por tipo (Cliente/Proveedor)
      return await prisma.contract.groupBy({ by: ['type'], _count: { _all: true } });
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_CURRENCY]: async () => {
      // Distribución por moneda
      return await prisma.contract.groupBy({ by: ['currency'], _count: { _all: true } });
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_BY_USER]: async () => {
      // Contratos por responsable/usuario
      return await prisma.contract.groupBy({ by: ['ownerId'], _count: { _all: true } });
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_CREATED_BY_MONTH]: async () => {
      // Contratos creados por mes
      return await prisma.$queryRawUnsafe(
        `SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count FROM Contract GROUP BY month ORDER BY month`
      );
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRED_BY_MONTH]: async () => {
      // Contratos vencidos por mes
      return await prisma.$queryRawUnsafe(
        `SELECT strftime('%Y-%m', endDate) as month, COUNT(*) as count FROM Contract WHERE status = 'Vencido' GROUP BY month ORDER BY month`
      );
    },
    [IPC_CHANNELS.STATISTICS.SUPPLEMENTS_COUNT_BY_CONTRACT]: async () => {
      // Cantidad de suplementos por contrato
      return await prisma.supplement.groupBy({ by: ['contractId'], _count: { _all: true } });
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRING_SOON]: async () => {
      // Contratos próximos a vencer en 30 días
      const now = new Date();
      const soon = new Date();
      soon.setDate(now.getDate() + 30);
      return await prisma.contract.findMany({
        where: { endDate: { gte: now, lte: soon }, status: 'Vigente' },
        select: { id: true, contractNumber: true, endDate: true }
      });
    },
    [IPC_CHANNELS.STATISTICS.CONTRACTS_WITHOUT_DOCUMENTS]: async () => {
      // Contratos sin documentos adjuntos
      return await prisma.contract.findMany({
        where: { documents: { none: {} } },
        select: { id: true, contractNumber: true }
      });
    },
    [IPC_CHANNELS.STATISTICS.USERS_ACTIVITY]: async () => {
      // Usuarios con más actividad (acciones en historial)
      return await prisma.historyRecord.groupBy({ by: ['userId'], _count: { _all: true } });
    },
  };

  eventManager.registerHandlers(handlers);
} 
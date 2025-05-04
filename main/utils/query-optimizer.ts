import { prisma } from "./prisma";

export class QueryOptimizer {
  async getDashboardStatistics() {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const [
      totalContracts,
      activeContracts,
      expiringContracts,
      expiredContracts,
      clientContracts,
      supplierContracts,
      recentActivity,
    ] = await Promise.all([
      prisma.contract.count(),
      prisma.contract.count({ where: { status: "Vigente" } }),
      prisma.contract.count({
        where: {
          endDate: {
            gte: today,
            lte: thirtyDaysLater,
          },
          status: "Vigente",
        },
      }),
      prisma.contract.count({ where: { status: "Vencido" } }),
      prisma.contract.count({ where: { type: "Cliente" } }),
      prisma.contract.count({ where: { type: "Proveedor" } }),
      prisma.contract.findMany({
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      totals: {
        total: totalContracts,
        active: activeContracts,
        expiring: expiringContracts,
        expired: expiredContracts,
      },
      distribution: {
        client: clientContracts,
        supplier: supplierContracts,
      },
      recentActivity,
    };
  }

  // Estadísticas generales de contratos
  async getContractsStats(filters?: any) {
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
    // Por mes de creación
    const byMonth = await prisma.$queryRawUnsafe(
      `SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count FROM Contract GROUP BY month ORDER BY month`
    );
    return { byStatus, byType, byMonth };
  }

  // Exportación simulada de estadísticas
  async exportStatistics(type: string, filters?: any) {
    // Esta función solo simula la exportación
    const fs = await import('fs');
    const path = await import('path');
    const EXPORTS_DIR = path.resolve(__dirname, '../../data/statistics/exports');
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    const exportPath = path.join(EXPORTS_DIR, `estadisticas_${type}_${Date.now()}.pdf`);
    fs.writeFileSync(exportPath, Buffer.from('PDF simulado de estadísticas'));
    return { path: exportPath };
  }

  // Distribución de contratos por estado
  async getContractsByStatus() {
    return prisma.contract.groupBy({ by: ['status'], _count: { _all: true } });
  }
  // Distribución por tipo
  async getContractsByType() {
    return prisma.contract.groupBy({ by: ['type'], _count: { _all: true } });
  }
  // Distribución por moneda
  async getContractsByCurrency() {
    return prisma.contract.groupBy({ by: ['currency'], _count: { _all: true } });
  }
  // Contratos por usuario
  async getContractsByUser() {
    return prisma.contract.groupBy({ by: ['ownerId'], _count: { _all: true } });
  }
  // Contratos creados por mes
  async getContractsCreatedByMonth() {
    return prisma.$queryRawUnsafe(
      `SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count FROM Contract GROUP BY month ORDER BY month`
    );
  }
  // Contratos vencidos por mes
  async getContractsExpiredByMonth() {
    return prisma.$queryRawUnsafe(
      `SELECT strftime('%Y-%m', endDate) as month, COUNT(*) as count FROM Contract WHERE status = 'Vencido' GROUP BY month ORDER BY month`
    );
  }
  // Cantidad de suplementos por contrato
  async getSupplementsCountByContract() {
    return prisma.supplement.groupBy({ by: ['contractId'], _count: { _all: true } });
  }
  // Contratos próximos a vencer en 30 días
  async getContractsExpiringSoon() {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 30);
    return prisma.contract.findMany({
      where: { endDate: { gte: now, lte: soon }, status: 'Vigente' },
      select: { id: true, contractNumber: true, endDate: true }
    });
  }
  // Contratos sin documentos adjuntos
  async getContractsWithoutDocuments() {
    return prisma.contract.findMany({
      where: { documents: { none: {} } },
      select: { id: true, contractNumber: true }
    });
  }
  // Usuarios con más actividad
  async getUsersActivity() {
    return prisma.historyRecord.groupBy({ by: ['userId'], _count: { _all: true } });
  }
}

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
}

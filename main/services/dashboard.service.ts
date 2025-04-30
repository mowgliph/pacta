import { prisma } from "../lib/prisma";
import { QueryOptimizer } from "../lib/query-optimizer";

export class DashboardService {
  private queryOptimizer: QueryOptimizer;

  constructor() {
    this.queryOptimizer = new QueryOptimizer();
  }

  async getDashboardStatistics() {
    try {
      const statistics = await this.queryOptimizer.getDashboardStatistics();
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      console.error("Error al obtener estadísticas del dashboard:", error);
      return {
        success: false,
        error: "No se pudieron obtener las estadísticas",
      };
    }
  }

  async getContractTrends() {
    try {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      const contracts = await prisma.contract.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo,
            lte: today,
          },
        },
        select: {
          createdAt: true,
          status: true,
          type: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Agrupar por mes y tipo
      const trends = contracts.reduce((acc, contract) => {
        const month = contract.createdAt.toISOString().slice(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = {
            total: 0,
            client: 0,
            supplier: 0,
            active: 0,
            expired: 0,
          };
        }

        acc[month].total++;
        if (contract.type === "Cliente") acc[month].client++;
        if (contract.type === "Proveedor") acc[month].supplier++;
        if (contract.status === "Vigente") acc[month].active++;
        if (contract.status === "Vencido") acc[month].expired++;

        return acc;
      }, {});

      return {
        success: true,
        data: trends,
      };
    } catch (error) {
      console.error("Error al obtener tendencias de contratos:", error);
      return {
        success: false,
        error: "No se pudieron obtener las tendencias",
      };
    }
  }

  async getUpcomingActions() {
    try {
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);

      const upcomingContracts = await prisma.contract.findMany({
        where: {
          endDate: {
            gte: today,
            lte: thirtyDaysLater,
          },
          status: "Vigente",
        },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          endDate: "asc",
        },
        take: 10,
      });

      const pendingSupplements = await prisma.supplement.findMany({
        where: {
          isApproved: false,
        },
        include: {
          contract: {
            select: {
              contractNumber: true,
              description: true,
            },
          },
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      return {
        success: true,
        data: {
          upcomingContracts,
          pendingSupplements,
        },
      };
    } catch (error) {
      console.error("Error al obtener acciones próximas:", error);
      return {
        success: false,
        error: "No se pudieron obtener las acciones próximas",
      };
    }
  }
}

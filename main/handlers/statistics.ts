import { ipcMain } from "electron";
import { prisma } from "../../lib/prisma";
import { StatisticsChannels } from "../channels/statistics.channels";

export function setupStatisticsHandlers() {
  // Obtener estadísticas básicas para el dashboard
  ipcMain.handle(StatisticsChannels.GET_BASIC_STATS, async () => {
    try {
      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);

      // Obtener total de contratos
      const totalContracts = await prisma.contract.count();

      // Obtener contratos activos
      const activeContracts = await prisma.contract.count({
        where: {
          status: "ACTIVE",
        },
      });

      // Obtener contratos próximos a vencer
      const expiringContracts = await prisma.contract.count({
        where: {
          endDate: {
            gte: today,
            lte: thirtyDaysLater,
          },
          status: "ACTIVE",
        },
      });

      // Obtener actividad reciente (últimos 7 días)
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const recentActivity = await prisma.contract.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      // Obtener distribución por estado
      const byState = await prisma.contract.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      });

      // Obtener distribución por tipo
      const byType = await prisma.contract.groupBy({
        by: ["type"],
        _count: {
          id: true,
        },
      });

      return {
        totalContracts,
        activeContracts,
        expiringContracts,
        recentActivity,
        byState: byState.map((item) => ({
          name: item.status,
          value: item._count.id,
          color: getStatusColor(item.status),
        })),
        byType: byType.map((item) => ({
          name: item.type,
          value: item._count.id,
          color: getTypeColor(item.type),
        })),
      };
    } catch (error) {
      console.error("Error al obtener estadísticas básicas:", error);
      throw error;
    }
  });
}

// Función auxiliar para obtener colores según el estado
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "#10B981", // Verde
    EXPIRING_SOON: "#F59E0B", // Amarillo
    EXPIRED: "#EF4444", // Rojo
    ARCHIVED: "#6B7280", // Gris
  };
  return colors[status] || "#6B7280";
}

// Función auxiliar para obtener colores según el tipo
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    CLIENT: "#3B82F6", // Azul
    PROVIDER: "#8B5CF6", // Púrpura
  };
  return colors[type] || "#6B7280";
}

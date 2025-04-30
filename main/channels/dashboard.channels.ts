import { ipcMain } from "electron";
import { DashboardService } from "../services/dashboard.service";
import { exportToExcel } from "../utils/excel-export";

const dashboardService = new DashboardService();

export function registerDashboardChannels() {
  // Obtener estadísticas del dashboard
  ipcMain.handle("get-dashboard-statistics", async () => {
    return await dashboardService.getDashboardStatistics();
  });

  // Obtener tendencias de contratos
  ipcMain.handle("get-contract-trends", async () => {
    return await dashboardService.getContractTrends();
  });

  // Obtener acciones próximas
  ipcMain.handle("get-upcoming-actions", async () => {
    return await dashboardService.getUpcomingActions();
  });

  // Exportar datos del dashboard
  ipcMain.handle(
    "export-dashboard-data",
    async (
      _,
      options: {
        type: "statistics" | "trends" | "actions";
        format: "excel" | "csv";
      }
    ) => {
      try {
        let data;
        switch (options.type) {
          case "statistics":
            data = await dashboardService.getDashboardStatistics();
            break;
          case "trends":
            data = await dashboardService.getContractTrends();
            break;
          case "actions":
            data = await dashboardService.getUpcomingActions();
            break;
          default:
            throw new Error("Tipo de exportación no válido");
        }

        if (!data.success) {
          throw new Error(data.error);
        }

        const fileName = `dashboard_${options.type}_${
          new Date().toISOString().split("T")[0]
        }`;
        const filePath = await exportToExcel(
          data.data,
          fileName,
          options.format
        );

        return {
          success: true,
          filePath,
        };
      } catch (error) {
        console.error("Error al exportar datos del dashboard:", error);
        return {
          success: false,
          error: "No se pudieron exportar los datos",
        };
      }
    }
  );
}

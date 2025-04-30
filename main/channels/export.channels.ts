import { ipcMain } from "electron";
import { exportToExcel } from "../utils/excel-export";
import { DashboardService } from "../services/dashboard.service";
import { ContractService } from "../services/contract.service";

const dashboardService = new DashboardService();
const contractService = new ContractService();

export function registerExportChannels() {
  // Exportar datos genéricos
  ipcMain.handle("export:data", async (_, options) => {
    try {
      const { format, fileName, data } = options;
      const filePath = await exportToExcel(data, fileName, format);
      return { success: true, filePath };
    } catch (error) {
      console.error("Error al exportar datos:", error);
      return { success: false, error: "No se pudo exportar los datos" };
    }
  });

  // Exportar estadísticas del dashboard
  ipcMain.handle("export:dashboard-stats", async (_, options) => {
    try {
      const { format } = options;
      const stats = await dashboardService.getDashboardStatistics();
      const fileName = `dashboard_stats_${
        new Date().toISOString().split("T")[0]
      }`;
      const filePath = await exportToExcel(stats, fileName, format);
      return { success: true, filePath };
    } catch (error) {
      console.error("Error al exportar estadísticas:", error);
      return { success: false, error: "No se pudo exportar las estadísticas" };
    }
  });

  // Exportar contratos
  ipcMain.handle("export:contracts", async (_, options) => {
    try {
      const { format, filters } = options;
      const contracts = await ContractService.getContracts(filters);
      const fileName = `contracts_${new Date().toISOString().split("T")[0]}`;
      const filePath = await exportToExcel(contracts, fileName, format);
      return { success: true, filePath };
    } catch (error) {
      console.error("Error al exportar contratos:", error);
      return { success: false, error: "No se pudo exportar los contratos" };
    }
  });

  ipcMain.handle(
    "export:toExcel",
    async (_, data: any, fileName: string, format: "excel" | "csv") => {
      return await exportToExcel(data, fileName, format);
    }
  );
}

import { ipcRenderer } from "electron";

export interface ExportOptions {
  format: "excel" | "csv";
  fileName: string;
  data: any;
}

export const exportService = {
  /**
   * Exporta datos a Excel o CSV
   */
  async exportData(
    options: ExportOptions
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      return await ipcRenderer.invoke("export:data", options);
    } catch (error) {
      console.error("Error al exportar datos:", error);
      return {
        success: false,
        error: "No se pudo exportar los datos",
      };
    }
  },

  /**
   * Exporta estadísticas del dashboard
   */
  async exportDashboardStats(
    format: "excel" | "csv" = "excel"
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      return await ipcRenderer.invoke("export:dashboard-stats", { format });
    } catch (error) {
      console.error("Error al exportar estadísticas:", error);
      return {
        success: false,
        error: "No se pudo exportar las estadísticas",
      };
    }
  },

  /**
   * Exporta lista de contratos
   */
  async exportContracts(
    format: "excel" | "csv" = "excel",
    filters?: any
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      return await ipcRenderer.invoke("export:contracts", { format, filters });
    } catch (error) {
      console.error("Error al exportar contratos:", error);
      return {
        success: false,
        error: "No se pudo exportar los contratos",
      };
    }
  },
};

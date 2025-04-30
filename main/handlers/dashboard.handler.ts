import { ipcMain } from "electron";
import { DashboardService } from "../services/dashboard.service";

export class DashboardHandler {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
    this.registerHandlers();
  }

  private registerHandlers() {
    ipcMain.handle("dashboard:getStatistics", async () => {
      return await this.dashboardService.getDashboardStatistics();
    });

    ipcMain.handle("dashboard:getTrends", async () => {
      return await this.dashboardService.getContractTrends();
    });

    ipcMain.handle("dashboard:getUpcomingActions", async () => {
      return await this.dashboardService.getUpcomingActions();
    });
  }
}

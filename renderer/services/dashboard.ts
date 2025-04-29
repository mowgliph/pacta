import { ipcRenderer } from "electron";
import {
  DashboardSummary,
  ContractByStatus,
  ContractByType,
  ActivityItem,
  RecentContract,
  UpcomingExpiration,
} from "../types/dashboard";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return await ipcRenderer.invoke("dashboard:getSummary");
  },

  async getByStatus(): Promise<ContractByStatus[]> {
    return await ipcRenderer.invoke("dashboard:getByStatus");
  },

  async getByType(): Promise<ContractByType[]> {
    return await ipcRenderer.invoke("dashboard:getByType");
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    return await ipcRenderer.invoke("dashboard:getRecentActivity");
  },

  async getRecentContracts(): Promise<RecentContract[]> {
    return await ipcRenderer.invoke("dashboard:getRecentContracts");
  },

  async getUpcomingExpirations(): Promise<UpcomingExpiration[]> {
    return await ipcRenderer.invoke("dashboard:getUpcomingExpirations");
  },
};

import { ipcMain } from "electron";

export enum SecurityChannels {
  GET_AUDIT_LOGS = "security:getAuditLogs",
  GET_SECURITY_EVENTS = "security:getSecurityEvents",
}

export interface SecurityRequests {
  [SecurityChannels.GET_AUDIT_LOGS]: {
    request: { filters?: any };
    response: { logs: any[] };
  };
  [SecurityChannels.GET_SECURITY_EVENTS]: {
    request: { filters?: any };
    response: { events: any[] };
  };
}

export function registerSecurityChannels() {
  ipcMain.handle(SecurityChannels.GET_AUDIT_LOGS, async (_, filters?: any) => {
    return { logs: [] };
  });

  ipcMain.handle(
    SecurityChannels.GET_SECURITY_EVENTS,
    async (_, filters?: any) => {
      return { events: [] };
    }
  );
}

import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { SecurityManager } from "../security/security-manager";
import { PermissionService } from "../security/permission-service";
import { RateLimiter } from "../security/rate-limiter";
import { withErrorHandling } from "../utils/error-handler";

export function registerSecurityHandlers(eventManager: EventManager): void {
  const securityManager = SecurityManager.getInstance();
  const permissionService = PermissionService.getInstance();
  const rateLimiter = RateLimiter.getInstance();

  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.SECURITY.PERMISSIONS.GET]: withErrorHandling(
      IPC_CHANNELS.SECURITY.PERMISSIONS.GET,
      async (event: Electron.IpcMainInvokeEvent, roleId: string) => {
        const permissions = await permissionService.getRolePermissions(roleId);
        return { success: true, data: permissions };
      }
    ),
    [IPC_CHANNELS.SECURITY.PERMISSIONS.CHECK]: withErrorHandling(
      IPC_CHANNELS.SECURITY.PERMISSIONS.CHECK,
      async (
        event: Electron.IpcMainInvokeEvent,
        { userId, resource, action }: any
      ) => {
        const hasPerm = await permissionService.hasPermission(
          userId,
          resource,
          action
        );
        return { success: true, data: hasPerm };
      }
    ),
    [IPC_CHANNELS.SECURITY.PERMISSIONS.UPDATE]: withErrorHandling(
      IPC_CHANNELS.SECURITY.PERMISSIONS.UPDATE,
      async (event: Electron.IpcMainInvokeEvent, { roleId }: any) => {
        permissionService.invalidateRoleCache(roleId);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.SECURITY.RATE_LIMIT.CHECK]: withErrorHandling(
      IPC_CHANNELS.SECURITY.RATE_LIMIT.CHECK,
      async (event: Electron.IpcMainInvokeEvent, { key, type }: any) => {
        if (type === "login") {
          const allowed = await rateLimiter.checkLoginAttempt(key);
          return { success: true, data: allowed };
        } else if (type === "api") {
          const allowed = await rateLimiter.checkApiRequest(key);
          return { success: true, data: allowed };
        }
        return { success: true, data: false };
      }
    ),
    [IPC_CHANNELS.SECURITY.RATE_LIMIT.RESET]: withErrorHandling(
      IPC_CHANNELS.SECURITY.RATE_LIMIT.RESET,
      async (event: Electron.IpcMainInvokeEvent, { key }: any) => {
        await rateLimiter.loginSuccessful(key);
        return { success: true, data: true };
      }
    ),
  };

  eventManager.registerHandlers(handlers);
}

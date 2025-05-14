const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { SecurityManager } = require("../security/security-manager.cjs");
const { PermissionService } = require("../security/permission-service.cjs");
const { RateLimiter } = require("../security/rate-limiter.cjs");
const { withErrorHandling } = require("../utils/error-handler.cjs");

function registerSecurityHandlers(eventManager) {
  const securityManager = SecurityManager.getInstance();
  const permissionService = PermissionService.getInstance();
  const rateLimiter = RateLimiter.getInstance();

  const handlers = {
    [IPC_CHANNELS.SECURITY.PERMISSIONS.GET]: withErrorHandling(
      IPC_CHANNELS.SECURITY.PERMISSIONS.GET,
      async (event, roleId) => {
        const permissions = await permissionService.getRolePermissions(roleId);
        return { success: true, data: permissions };
      }
    ),
    [IPC_CHANNELS.SECURITY.PERMISSIONS.CHECK]: withErrorHandling(
      IPC_CHANNELS.SECURITY.PERMISSIONS.CHECK,
      async (event, { userId, resource, action }) => {
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
      async (event, { roleId }) => {
        permissionService.invalidateRoleCache(roleId);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.SECURITY.RATE_LIMIT.CHECK]: withErrorHandling(
      IPC_CHANNELS.SECURITY.RATE_LIMIT.CHECK,
      async (event, { key, type }) => {
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
      async (event, { key }) => {
        await rateLimiter.loginSuccessful(key);
        return { success: true, data: true };
      }
    ),
  };

  eventManager.registerHandlers(handlers);
}

module.exports = { registerSecurityHandlers };

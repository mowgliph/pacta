const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { securityManager } = require("../security/security-manager.cjs");
const { permissionService } = require("../security/permission-service.cjs");
const { rateLimiter } = require("../security/rate-limiter.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");

function registerSecurityHandlers() {
  const eventManager = EventManager.getInstance();

  const handlers = {
    [IPC_CHANNELS.SECURITY.PERMISSIONS.GET]: async (event, roleId) => {
      if (!roleId) {
        throw AppError.validation("ID de rol requerido", "ROLE_ID_REQUIRED");
      }

      const permissions = await permissionService.getRolePermissions(roleId);
      if (!permissions) {
        throw AppError.notFound(
          "Permisos no encontrados",
          "PERMISSIONS_NOT_FOUND",
          { roleId }
        );
      }

      return permissions;
    },

    [IPC_CHANNELS.SECURITY.PERMISSIONS.CHECK]: async (
      event,
      { userId, resource, action }
    ) => {
      if (!userId || !resource || !action) {
        throw AppError.validation(
          "Datos de permiso incompletos",
          "INVALID_PERMISSION_CHECK",
          {
            required: ["userId", "resource", "action"],
          }
        );
      }

      return await permissionService.hasPermission(userId, resource, action);
    },

    [IPC_CHANNELS.SECURITY.PERMISSIONS.UPDATE]: async (event, { roleId }) => {
      if (!roleId) {
        throw AppError.validation("ID de rol requerido", "ROLE_ID_REQUIRED");
      }

      await permissionService.invalidateRoleCache(roleId);
      return true;
    },

    [IPC_CHANNELS.SECURITY.RATE_LIMIT.CHECK]: async (event, { key, type }) => {
      if (!key || !type) {
        throw AppError.validation(
          "Datos de rate limit incompletos",
          "INVALID_RATE_LIMIT_CHECK",
          {
            required: ["key", "type"],
          }
        );
      }

      switch (type) {
        case "login":
          return await rateLimiter.checkLoginAttempt(key);
        case "api":
          return await rateLimiter.checkApiRequest(key);
        default:
          throw AppError.validation(
            "Tipo de rate limit inválido",
            "INVALID_RATE_LIMIT_TYPE",
            {
              allowedTypes: ["login", "api"],
            }
          );
      }
    },

    [IPC_CHANNELS.SECURITY.RATE_LIMIT.RESET]: async (event, { key }) => {
      if (!key) {
        throw AppError.validation("Key requerida", "KEY_REQUIRED");
      }

      await rateLimiter.loginSuccessful(key);
      return true;
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerSecurityHandlers,
};

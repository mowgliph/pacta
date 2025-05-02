import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { SecurityManager } from '../security/security-manager';
import { PermissionService } from '../security/permission-service';
import { RateLimiter } from '../security/rate-limiter';

export function registerSecurityHandlers(eventManager: EventManager): void {
  const securityManager = SecurityManager.getInstance();
  const permissionService = PermissionService.getInstance();
  const rateLimiter = RateLimiter.getInstance();

  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.SECURITY.PERMISSIONS.GET]: async (event, roleId: string) => {
      logger.info('Obteniendo permisos para rol:', roleId);
      return permissionService.getRolePermissions(roleId);
    },

    [IPC_CHANNELS.SECURITY.PERMISSIONS.CHECK]: async (event, { userId, resource, action }) => {
      logger.info('Verificando permiso:', { userId, resource, action });
      return permissionService.hasPermission(userId, resource, action);
    },

    [IPC_CHANNELS.SECURITY.PERMISSIONS.UPDATE]: async (event, { roleId }) => {
      logger.info('Invalidando caché de permisos para rol:', roleId);
      permissionService.invalidateRoleCache(roleId);
      return true;
    },

    [IPC_CHANNELS.SECURITY.RATE_LIMIT.CHECK]: async (event, { key, type }) => {
      logger.info('Verificando rate limit:', { key, type });
      if (type === 'login') {
        return rateLimiter.checkLoginAttempt(key);
      } else if (type === 'api') {
        return rateLimiter.checkApiRequest(key);
      }
      return false;
    },

    [IPC_CHANNELS.SECURITY.RATE_LIMIT.RESET]: async (event, { key }) => {
      logger.info('Reseteando rate limit:', { key });
      await rateLimiter.loginSuccessful(key);
      return true;
    }
  };

  eventManager.registerHandlers(handlers);
} 
import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';

export function registerAuthHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.AUTH.LOGIN]: async (event, credentials) => {
      logger.info('Intento de inicio de sesión', { username: credentials.username });
      // TODO: Implementar lógica de autenticación
      return { token: 'dummy-token' };
    },

    [IPC_CHANNELS.AUTH.LOGOUT]: async (event) => {
      logger.info('Cierre de sesión solicitado');
      // TODO: Implementar lógica de cierre de sesión
      return true;
    },

    [IPC_CHANNELS.AUTH.VERIFY]: async (event, token) => {
      logger.info('Verificación de token solicitada');
      // TODO: Implementar verificación de token
      return true;
    },

    [IPC_CHANNELS.AUTH.REFRESH]: async (event, refreshToken) => {
      logger.info('Refresco de token solicitado');
      // TODO: Implementar refresco de token
      return { token: 'new-dummy-token' };
    }
  };

  eventManager.registerHandlers(handlers);
} 
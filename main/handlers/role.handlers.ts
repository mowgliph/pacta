import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';

export function registerRoleHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.ROLES.LIST]: async () => {
      logger.info('Listado de roles solicitado');
      try {
        return await prisma.role.findMany();
      } catch (error) {
        logger.error('Error al listar roles:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.ROLES.CREATE]: async (event, roleData) => {
      logger.info('Creación de rol solicitada', { roleData });
      try {
        if (!roleData.name || !roleData.description || !roleData.permissions) {
          throw new Error('Faltan campos obligatorios');
        }
        const role = await prisma.role.create({
          data: {
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
            isSystem: !!roleData.isSystem,
          }
        });
        return role;
      } catch (error) {
        logger.error('Error al crear rol:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.ROLES.UPDATE]: async (event, roleData) => {
      logger.info('Actualización de rol solicitada', { roleData });
      try {
        if (!roleData.id) throw new Error('ID requerido');
        const role = await prisma.role.update({
          where: { id: roleData.id },
          data: {
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
            isSystem: roleData.isSystem,
          }
        });
        return role;
      } catch (error) {
        logger.error('Error al actualizar rol:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.ROLES.DELETE]: async (event, id) => {
      logger.info('Eliminación de rol solicitada', { id });
      try {
        await prisma.role.delete({ where: { id } });
        return true;
      } catch (error) {
        logger.error('Error al eliminar rol:', error);
        throw error;
      }
    }
  };

  eventManager.registerHandlers(handlers);
} 
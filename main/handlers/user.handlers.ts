import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';
import { UserCreateSchema, UserUpdateSchema } from '../validations/schemas/user.schema';

export function registerUserHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.USERS.LIST]: async (event) => {
      logger.info('Listado de usuarios solicitado');
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        });
        return users;
      } catch (error) {
        logger.error('Error al listar usuarios:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.USERS.CREATE]: async (event, userData) => {
      logger.info('Creación de usuario solicitada', { userData });
      try {
        const parsed = UserCreateSchema.parse(userData);
        const hashedPassword = await bcrypt.hash(parsed.password, 10);
        const user = await prisma.user.create({
          data: {
            ...parsed,
            password: hashedPassword,
          }
        });
        const { password, ...userSafe } = user;
        return userSafe;
      } catch (error) {
        logger.error('Error al crear usuario:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.USERS.UPDATE]: async (event, userData) => {
      logger.info('Actualización de usuario solicitada', { userData });
      try {
        const parsed = UserUpdateSchema.parse(userData);
        const { id, ...data } = parsed;
        if ('password' in data) delete (data as any).password;
        const user = await prisma.user.update({
          where: { id },
          data,
        });
        const { password, ...userSafe } = user;
        return userSafe;
      } catch (error) {
        logger.error('Error al actualizar usuario:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.USERS.DELETE]: async (event, id) => {
      logger.info('Eliminación de usuario solicitada', { id });
      try {
        await prisma.user.delete({ where: { id } });
        return true;
      } catch (error) {
        logger.error('Error al eliminar usuario:', error);
        throw error;
      }
    }
  };

  eventManager.registerHandlers(handlers);
} 
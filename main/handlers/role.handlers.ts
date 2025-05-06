import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { logger } from "../utils/logger";
import { prisma } from "../utils/prisma";
import { withErrorHandling } from "../utils/error-handler";

export function registerRoleHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.ROLES.LIST]: withErrorHandling(
      IPC_CHANNELS.DATA.ROLES.LIST,
      async () => {
        const roles = await prisma.role.findMany();
        return { success: true, data: roles };
      }
    ),
    [IPC_CHANNELS.DATA.ROLES.CREATE]: withErrorHandling(
      IPC_CHANNELS.DATA.ROLES.CREATE,
      async (event: Electron.IpcMainInvokeEvent, roleData: any) => {
        if (!roleData.name || !roleData.description || !roleData.permissions) {
          throw new Error("Faltan campos obligatorios");
        }
        const role = await prisma.role.create({
          data: {
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
            isSystem: !!roleData.isSystem,
          },
        });
        return { success: true, data: role };
      }
    ),
    [IPC_CHANNELS.DATA.ROLES.UPDATE]: withErrorHandling(
      IPC_CHANNELS.DATA.ROLES.UPDATE,
      async (event: Electron.IpcMainInvokeEvent, roleData: any) => {
        if (!roleData.id) throw new Error("ID requerido");
        const role = await prisma.role.update({
          where: { id: roleData.id },
          data: {
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
            isSystem: roleData.isSystem,
          },
        });
        return { success: true, data: role };
      }
    ),
    [IPC_CHANNELS.DATA.ROLES.DELETE]: withErrorHandling(
      IPC_CHANNELS.DATA.ROLES.DELETE,
      async (event: Electron.IpcMainInvokeEvent, id: string) => {
        await prisma.role.delete({ where: { id } });
        return { success: true, data: true };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

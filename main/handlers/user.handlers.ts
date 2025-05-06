import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { prisma } from "../utils/prisma";
import { withErrorHandling } from "../utils/error-handler";

export function registerUserHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.USERS.LIST]: withErrorHandling(
      IPC_CHANNELS.DATA.USERS.LIST,
      async (event: Electron.IpcMainInvokeEvent) => {
        const users = await prisma.user.findMany();
        return { success: true, data: users };
      }
    ),
    [IPC_CHANNELS.DATA.USERS.CREATE]: withErrorHandling(
      IPC_CHANNELS.DATA.USERS.CREATE,
      async (event: Electron.IpcMainInvokeEvent, userData: any) => {
        const user = await prisma.user.create({ data: userData });
        return { success: true, data: user };
      }
    ),
    [IPC_CHANNELS.DATA.USERS.UPDATE]: withErrorHandling(
      IPC_CHANNELS.DATA.USERS.UPDATE,
      async (
        event: Electron.IpcMainInvokeEvent,
        userId: string,
        userData: any
      ) => {
        const user = await prisma.user.update({
          where: { id: userId },
          data: userData,
        });
        return { success: true, data: user };
      }
    ),
    [IPC_CHANNELS.DATA.USERS.DELETE]: withErrorHandling(
      IPC_CHANNELS.DATA.USERS.DELETE,
      async (event: Electron.IpcMainInvokeEvent, userId: string) => {
        await prisma.user.delete({ where: { id: userId } });
        return { success: true, data: true };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { withErrorHandling } = require("../utils/error-handler.cjs");

function registerUserHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.DATA.USERS.LIST]: withErrorHandling(
      IPC_CHANNELS.DATA.USERS.LIST,
      async (event) => {
        const users = await prisma.user.findMany();
        return { success: true, data: users };
      }
    ),
    [IPC_CHANNELS.DATA.USERS.CREATE]: withErrorHandling(
      IPC_CHANNELS.DATA.USERS.CREATE,
      async (event, userData) => {
        const user = await prisma.user.create({ data: userData });
        return { success: true, data: user };
      }
    ),
    [IPC_CHANNELS.DATA.USERS.UPDATE]: withErrorHandling(
      IPC_CHANNELS.DATA.USERS.UPDATE,
      async (event, userId, userData) => {
        const user = await prisma.user.update({
          where: { id: userId },
          data: userData,
        });
        return { success: true, data: user };
      }
    ),
    [IPC_CHANNELS.DATA.USERS.DELETE]: withErrorHandling(
      IPC_CHANNELS.DATA.USERS.DELETE,
      async (event, userId) => {
        await prisma.user.delete({ where: { id: userId } });
        return { success: true, data: true };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

module.exports = { registerUserHandlers };

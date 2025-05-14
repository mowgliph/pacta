const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { withErrorHandling } = require("../utils/error-handler.cjs");

function registerRoleHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.DATA.ROLES.LIST]: withErrorHandling(
      IPC_CHANNELS.DATA.ROLES.LIST,
      async () => {
        const roles = await prisma.role.findMany();
        return { success: true, data: roles };
      }
    ),
    [IPC_CHANNELS.DATA.ROLES.CREATE]: withErrorHandling(
      IPC_CHANNELS.DATA.ROLES.CREATE,
      async (event, roleData) => {
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
      async (event, roleData) => {
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
      async (event, id) => {
        await prisma.role.delete({ where: { id } });
        return { success: true, data: true };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

module.exports = { registerRoleHandlers };

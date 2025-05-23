const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");

function registerRoleHandlers() {
  const eventManager = EventManager.getInstance();

  const handlers = {
    [IPC_CHANNELS.DATA.ROLES.LIST]: async () => {
      return await prisma.role.findMany({
        orderBy: { name: "asc" },
      });
    },

    [IPC_CHANNELS.DATA.ROLES.CREATE]: async (event, roleData) => {
      if (!roleData.name || !roleData.description || !roleData.permissions) {
        throw AppError.validation(
          "Faltan campos obligatorios",
          "MISSING_REQUIRED_FIELDS",
          { required: ["name", "description", "permissions"] }
        );
      }

      const role = await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          isSystem: !!roleData.isSystem,
        },
      });

      return role;
    },

    [IPC_CHANNELS.DATA.ROLES.UPDATE]: async (event, roleData) => {
      if (!roleData.id) {
        throw new Error("ID requerido");
      }

      // Verificar que el rol existe y no es un rol del sistema
      const existingRole = await prisma.role.findUnique({
        where: { id: roleData.id },
      });

      if (!existingRole) {
        throw new Error("Rol no encontrado");
      }

      if (existingRole.isSystem) {
        throw new Error("No se pueden modificar roles del sistema");
      }

      const role = await prisma.role.update({
        where: { id: roleData.id },
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          isSystem: roleData.isSystem,
        },
      });

      return role;
    },

    [IPC_CHANNELS.DATA.ROLES.DELETE]: async (event, id) => {
      // Verificar que el rol existe y no es un rol del sistema
      const role = await prisma.role.findUnique({
        where: { id },
        include: { users: true },
      });

      if (!role) {
        throw new Error("Rol no encontrado");
      }

      if (role.isSystem) {
        throw new Error("No se pueden eliminar roles del sistema");
      }

      if (role.users.length > 0) {
        throw new Error(
          "No se puede eliminar un rol que tiene usuarios asignados"
        );
      }

      await prisma.role.delete({ where: { id } });
      return true;
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerRoleHandlers,
};

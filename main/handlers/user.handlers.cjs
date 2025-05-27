const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { AppError } = require("../utils/error-handler.cjs");
const { EventManager } = require("../events/event-manager.cjs");

function registerUserHandlers() {
  const eventManager = EventManager.getInstance();
  const handlers = {
    [IPC_CHANNELS.DATA.USERS.LIST]: async (event) => {
      try {
        const users = await prisma.user.findMany();
        
        // Validar que los datos son un array
        if (!Array.isArray(users)) {
          console.error("Error: La respuesta de la base de datos no es un array");
          return {
            success: false,
            data: {
              users: [],
              total: 0
            },
            error: {
              message: "Error en la respuesta de la base de datos",
              code: "INVALID_RESPONSE",
              context: {
                operation: "list",
                timestamp: new Date().toISOString(),
                errorDetails: "La respuesta no es un array"
              }
            }
          };
        }

        console.info("Usuarios listados exitosamente", { count: users.length });
        return { 
          success: true, 
          data: { 
            users,
            total: users.length 
          } 
        };
      } catch (error) {
        console.error("Error al listar usuarios:", error);
        
        // Asegurarnos de que siempre devolvemos un objeto con la estructura correcta
        return {
          success: false,
          data: {
            users: [],
            total: 0
          },
          error: {
            message: error.message || "Error al listar usuarios",
            code: "USER_LIST_ERROR",
            context: {
              operation: "list",
              timestamp: new Date().toISOString(),
              errorDetails: error.message
            }
          }
        };
      }
    },
    [IPC_CHANNELS.DATA.USERS.CREATE]: async (event, userData) => {
      try {
        if (!userData) {
          throw AppError.validation(
            "Datos de usuario requeridos",
            "USER_DATA_REQUIRED"
          );
        }

        const user = await prisma.user.create({ data: userData });
        console.info("Usuario creado exitosamente", { userId: user.id });
        return { success: true, data: user };
      } catch (error) {
        console.error("Error al crear usuario:", error);
        throw AppError.internal(
          "Error al crear usuario",
          "USER_CREATE_ERROR",
          { error: error.message }
        );
      }
    },
    [IPC_CHANNELS.DATA.USERS.UPDATE]: async (event, userId, userData) => {
      try {
        if (!userId) {
          throw AppError.validation(
            "ID de usuario requerido",
            "USER_ID_REQUIRED"
          );
        }
        if (!userData) {
          throw AppError.validation(
            "Datos de usuario requeridos",
            "USER_DATA_REQUIRED"
          );
        }

        const user = await prisma.user.update({
          where: { id: userId },
          data: userData,
        });

        if (!user) {
          throw AppError.notFound(
            "Usuario no encontrado",
            "USER_NOT_FOUND"
          );
        }

        console.info("Usuario actualizado exitosamente", { userId });
        return { success: true, data: user };
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
        throw AppError.internal(
          "Error al actualizar usuario",
          "USER_UPDATE_ERROR",
          { error: error.message }
        );
      }
    },
    [IPC_CHANNELS.DATA.USERS.DELETE]: async (event, userId) => {
      try {
        if (!userId) {
          throw AppError.validation(
            "ID de usuario requerido",
            "USER_ID_REQUIRED"
          );
        }

        const user = await prisma.user.delete({ where: { id: userId } });

        if (!user) {
          throw AppError.notFound(
            "Usuario no encontrado",
            "USER_NOT_FOUND"
          );
        }

        console.info("Usuario eliminado exitosamente", { userId });
        return { success: true, data: user };
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        throw AppError.internal(
          "Error al eliminar usuario",
          "USER_DELETE_ERROR",
          { error: error.message }
        );
      }
    },
    [IPC_CHANNELS.DATA.USERS.GET_BY_ID]: async (event, id) => {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw AppError.notFound(
          "Usuario no encontrado",
          "USER_NOT_FOUND"
        );
      }

      return { success: true, data: user };
    },
  };
  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = { registerUserHandlers };

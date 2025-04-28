import { withErrorHandling } from "../setup";
import { ErrorHandler } from "../error-handler";
import { logger } from "../../utils/logger";
import { z } from "zod";
import { UserService } from "../services/user.service";
import { RoleService } from "../services/role.service";
import { UsersChannels, RolesChannels } from "../channels/users.channels";

// Esquemas de validación
const userCreateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roleId: z.string().uuid(),
});

const userUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

const passwordChangeSchema = z.object({
  userId: z.string().uuid(),
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

/**
 * Configurar manejadores IPC para usuarios y roles
 */
export function setupUserHandlers(): void {
  logger.info("Configurando manejadores IPC para usuarios");

  // Obtener todos los usuarios
  withErrorHandling(UsersChannels.GET_ALL, async () => {
    try {
      return await UserService.getUsers();
    } catch (error) {
      logger.error("Error al obtener usuarios:", error);
      throw error;
    }
  });

  // Obtener un usuario por ID
  withErrorHandling(UsersChannels.GET_BY_ID, async (_, userId: string) => {
    try {
      if (!userId) {
        throw ErrorHandler.createError(
          "ValidationError",
          "El ID del usuario es requerido"
        );
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        throw ErrorHandler.createError(
          "NotFoundError",
          "Usuario no encontrado"
        );
      }

      return user;
    } catch (error) {
      logger.error(`Error al obtener usuario ${userId}:`, error);
      throw error;
    }
  });

  // Crear un nuevo usuario
  withErrorHandling(
    UsersChannels.CREATE,
    async (_, userData, creatorId: string) => {
      try {
        // Validar datos con Zod
        const validatedData = userCreateSchema.parse(userData);

        // Verificar si el email ya existe
        const existingUser = await UserService.getUserByEmail(
          validatedData.email
        );
        if (existingUser) {
          throw ErrorHandler.createError(
            "ValidationError",
            "Ya existe un usuario con este email"
          );
        }

        // Crear usuario
        const newUser = await UserService.createUser(validatedData, creatorId);

        logger.info(`Usuario creado: ${newUser.id} (${newUser.email})`);
        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roleId: newUser.roleId,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors = error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          }));

          logger.warn(
            "Error de validación al crear usuario:",
            validationErrors
          );
          throw ErrorHandler.createError(
            "ValidationError",
            `Error de validación: ${validationErrors[0].message}`,
            validationErrors
          );
        }

        logger.error("Error al crear usuario:", error);
        throw error;
      }
    }
  );

  // Actualizar un usuario
  withErrorHandling(
    UsersChannels.UPDATE,
    async (_, userData, updaterId: string) => {
      try {
        // Validar datos con Zod
        const validatedData = userUpdateSchema.parse(userData);

        // Si se está actualizando el email, verificar que no exista
        if (validatedData.email) {
          const existingUser = await UserService.getUserByEmail(
            validatedData.email
          );
          if (existingUser && existingUser.id !== validatedData.id) {
            throw ErrorHandler.createError(
              "ValidationError",
              "Ya existe un usuario con este email"
            );
          }
        }

        // Actualizar usuario
        const updatedUser = await UserService.updateUser(
          validatedData.id,
          validatedData,
          updaterId
        );

        if (!updatedUser) {
          throw ErrorHandler.createError(
            "NotFoundError",
            "Usuario no encontrado"
          );
        }

        logger.info(`Usuario actualizado: ${updatedUser.id}`);
        return {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          roleId: updatedUser.roleId,
          isActive: updatedUser.isActive,
          updatedAt: updatedUser.updatedAt,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors = error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          }));

          logger.warn(
            "Error de validación al actualizar usuario:",
            validationErrors
          );
          throw ErrorHandler.createError(
            "ValidationError",
            `Error de validación: ${validationErrors[0].message}`,
            validationErrors
          );
        }

        logger.error("Error al actualizar usuario:", error);
        throw error;
      }
    }
  );

  // Eliminar un usuario (desactivar)
  withErrorHandling(
    UsersChannels.TOGGLE_ACTIVE,
    async (_, userId: string, adminId: string) => {
      try {
        if (!userId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "El ID del usuario es requerido"
          );
        }

        if (!adminId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "El ID del administrador es requerido"
          );
        }

        const result = await UserService.toggleUserActive(userId, adminId);

        if (!result) {
          throw ErrorHandler.createError(
            "NotFoundError",
            "Usuario no encontrado"
          );
        }

        logger.info(
          `Estado de usuario cambiado: ${userId}, activo: ${result.isActive}`
        );
        return { success: true, isActive: result.isActive };
      } catch (error) {
        logger.error(`Error al cambiar estado de usuario ${userId}:`, error);
        throw error;
      }
    }
  );

  // Cambiar contraseña
  withErrorHandling(UsersChannels.CHANGE_PASSWORD, async (_, passwordData) => {
    try {
      // Validar datos con Zod
      const validatedData = passwordChangeSchema.parse(passwordData);

      const success = await UserService.changePassword(
        validatedData.userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      if (!success) {
        throw ErrorHandler.createError(
          "ValidationError",
          "La contraseña actual es incorrecta"
        );
      }

      logger.info(`Contraseña cambiada para usuario: ${validatedData.userId}`);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        logger.warn(
          "Error de validación al cambiar contraseña:",
          validationErrors
        );
        throw ErrorHandler.createError(
          "ValidationError",
          `Error de validación: ${validationErrors[0].message}`,
          validationErrors
        );
      }

      logger.error("Error al cambiar contraseña:", error);
      throw error;
    }
  });

  // Obtener todos los roles
  withErrorHandling(RolesChannels.GET_ALL, async () => {
    try {
      return await RoleService.getRoles();
    } catch (error) {
      logger.error("Error al obtener roles:", error);
      throw error;
    }
  });

  // Obtener permisos de un usuario
  withErrorHandling("users:getPermissions", async (_, userId: string) => {
    try {
      if (!userId) {
        throw ErrorHandler.createError(
          "ValidationError",
          "El ID del usuario es requerido"
        );
      }

      const permissions = await UserService.getUserPermissions(userId);

      return permissions;
    } catch (error) {
      logger.error(`Error al obtener permisos de usuario ${userId}:`, error);
      throw error;
    }
  });
}

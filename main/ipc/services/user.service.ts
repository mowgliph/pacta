import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../error-handler";

/**
 * Servicio para la gestión de usuarios
 */
export class UserService {
  /**
   * Obtiene todos los usuarios
   */
  static async getUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          roleId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return { users, total: users.length };
    } catch (error) {
      logger.error("Error al obtener usuarios:", error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario
   */
  static async getUserById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          roleId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por su email
   * @param email - Email del usuario
   */
  static async getUserByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          roleId: true,
          isActive: true,
        },
      });
    } catch (error) {
      logger.error(`Error al obtener usuario por email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param userData - Datos del usuario
   * @param creatorId - ID del usuario que crea
   */
  static async createUser(userData: any, creatorId: string) {
    try {
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          roleId: userData.roleId,
          isActive: true,
        },
      });

      // Registrar en historial
      await prisma.historyRecord.create({
        data: {
          action: "CREATE",
          entityType: "User",
          entityId: user.id,
          userId: creatorId,
          changes: `Usuario ${user.name} (${user.email}) creado`,
        },
      });

      return user;
    } catch (error) {
      logger.error("Error al crear usuario:", error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   * @param id - ID del usuario
   * @param userData - Datos a actualizar
   * @param updaterId - ID del usuario que actualiza
   */
  static async updateUser(id: string, userData: any, updaterId: string) {
    try {
      // Preparar datos para actualizar
      const updateData: any = {};

      if (userData.name) updateData.name = userData.name;
      if (userData.email) updateData.email = userData.email;
      if (userData.roleId) updateData.roleId = userData.roleId;
      if (userData.isActive !== undefined)
        updateData.isActive = userData.isActive;

      // Si hay contraseña, encriptarla
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
      }

      // Actualizar usuario
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      // Registrar en historial
      await prisma.historyRecord.create({
        data: {
          action: "UPDATE",
          entityType: "User",
          entityId: id,
          userId: updaterId,
          changes: `Usuario ${user.name} (${user.email}) actualizado`,
        },
      });

      return user;
    } catch (error) {
      logger.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cambia el estado activo/inactivo de un usuario
   * @param id - ID del usuario
   * @param adminId - ID del administrador
   */
  static async toggleUserActive(id: string, adminId: string) {
    try {
      // Obtener usuario actual
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return null;
      }

      // Cambiar estado
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          isActive: !user.isActive,
        },
      });

      // Registrar en historial
      await prisma.historyRecord.create({
        data: {
          action: "UPDATE",
          entityType: "User",
          entityId: id,
          userId: adminId,
          changes: `Usuario ${user.name} ${
            updatedUser.isActive ? "activado" : "desactivado"
          }`,
        },
      });

      return updatedUser;
    } catch (error) {
      logger.error(`Error al cambiar estado de usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param userId - ID del usuario
   * @param currentPassword - Contraseña actual
   * @param newPassword - Nueva contraseña
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      // Obtener usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user) {
        return false;
      }

      // Verificar contraseña actual
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return false;
      }

      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });

      // Registrar en historial
      await prisma.historyRecord.create({
        data: {
          action: "UPDATE",
          entityType: "User",
          entityId: userId,
          userId,
          changes: "Contraseña actualizada",
        },
      });

      return true;
    } catch (error) {
      logger.error(`Error al cambiar contraseña de usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene los permisos de un usuario
   * @param userId - ID del usuario
   */
  static async getUserPermissions(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw ErrorHandler.createError(
          "NotFoundError",
          "Usuario no encontrado"
        );
      }

      // Convertir permisos de string a objeto si es necesario
      let permissions = {};

      if (user.role && typeof user.role.permissions === "string") {
        try {
          permissions = JSON.parse(user.role.permissions);
        } catch (e) {
          logger.warn(`Error al parsear permisos para usuario ${userId}:`, e);
        }
      } else if (user.role && typeof user.role.permissions === "object") {
        permissions = user.role.permissions;
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        role: {
          id: user.role?.id,
          name: user.role?.name,
        },
        permissions,
      };
    } catch (error) {
      logger.error(`Error al obtener permisos de usuario ${userId}:`, error);
      throw error;
    }
  }
}

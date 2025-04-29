import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";

/**
 * Servicio para la gestión de roles
 */
export class RoleService {
  /**
   * Obtener todos los roles
   */
  static async getRoles() {
    try {
      const roles = await prisma.role.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return { roles };
    } catch (error) {
      logger.error("Error al obtener roles:", error);
      throw error;
    }
  }

  /**
   * Obtener un rol por su ID
   * @param id - ID del rol
   */
  static async getRoleById(id: string) {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      return role;
    } catch (error) {
      logger.error(`Error al obtener rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo rol
   * @param roleData - Datos del rol
   * @param creatorId - ID del usuario que crea
   */
  static async createRole(roleData: any, creatorId: string) {
    try {
      // Verificar si ya existe un rol con el mismo nombre (comparación directa)
      const existingRole = await prisma.role.findFirst({
        where: {
          name: roleData.name,
        },
      });

      if (existingRole) {
        throw new Error("Ya existe un rol con este nombre");
      }

      // Crear el rol
      const role = await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        },
      });

      // Registrar en historial
      await prisma.historyRecord.create({
        data: {
          action: "CREATE",
          entityType: "Role",
          entityId: role.id,
          userId: creatorId,
          changes: JSON.stringify(roleData),
        },
      });

      return role;
    } catch (error) {
      logger.error("Error al crear rol:", error);
      throw error;
    }
  }

  /**
   * Actualizar un rol existente
   * @param id - ID del rol
   * @param roleData - Datos a actualizar
   * @param updaterId - ID del usuario que actualiza
   */
  static async updateRole(id: string, roleData: any, updaterId: string) {
    try {
      // Verificar si el rol existe
      const role = await prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new Error("Rol no encontrado");
      }

      // Si se actualiza el nombre, verificar que no exista otro rol con el mismo nombre
      if (roleData.name && roleData.name !== role.name) {
        const existingRole = await prisma.role.findFirst({
          where: {
            name: roleData.name,
            id: {
              not: id,
            },
          },
        });

        if (existingRole) {
          throw new Error("Ya existe un rol con este nombre");
        }
      }

      // Actualizar el rol
      const updatedRole = await prisma.role.update({
        where: { id },
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        },
      });

      // Registrar cambios en historial
      await prisma.historyRecord.create({
        data: {
          action: "UPDATE",
          entityType: "Role",
          entityId: id,
          userId: updaterId,
          changes: JSON.stringify(roleData),
        },
      });

      return updatedRole;
    } catch (error) {
      logger.error(`Error al actualizar rol ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un rol
   * @param id - ID del rol
   * @param userId - ID del usuario que elimina
   */
  static async deleteRole(id: string, userId: string) {
    try {
      // Verificar si el rol existe
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      if (!role) {
        throw new Error("Rol no encontrado");
      }

      // Verificar si hay usuarios que usan este rol
      if (role._count.users > 0) {
        throw new Error(
          "No se puede eliminar un rol que está siendo utilizado por usuarios"
        );
      }

      // Eliminar el rol
      await prisma.role.delete({
        where: { id },
      });

      // Registrar en historial
      await prisma.historyRecord.create({
        data: {
          action: "DELETE",
          entityType: "Role",
          entityId: id,
          userId,
        },
      });

      return true;
    } catch (error) {
      logger.error(`Error al eliminar rol ${id}:`, error);
      throw error;
    }
  }
}

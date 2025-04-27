import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { Contract, ContractFilters } from "../shared/types";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "../middleware/error.middleware";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * Servicio para manejar operaciones relacionadas con los contratos
 */
export class ContractService {
  /**
   * Obtiene todos los contratos con filtros opcionales
   * @param filters - Filtros opcionales para los contratos
   * @param userId - ID del usuario que realiza la consulta
   * @param userRole - Rol del usuario
   */
  static async getContracts(
    filters?: ContractFilters,
    userId?: string,
    userRole?: string
  ) {
    try {
      // Construir las condiciones de filtrado
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.startDate) {
        where.startDate = {
          gte: filters.startDate,
        };
      }

      if (filters?.endDate) {
        where.endDate = {
          lte: filters.endDate,
        };
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      // Si no es administrador, mostrar solo contratos a los que tiene acceso
      if (userRole !== "Admin") {
        where.OR = [
          { createdById: userId },
          {
            ContractAccess: {
              some: {
                userId,
              },
            },
          },
          {
            ContractAccessRole: {
              some: {
                role: {
                  users: {
                    some: {
                      id: userId,
                    },
                  },
                },
              },
            },
          },
        ];
      }

      // Obtener los contratos con sus relaciones
      const contracts = await prisma.contract.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ContractAccess: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      // Transformar los resultados al formato esperado
      return contracts.map((contract) => this.mapContractToDTO(contract));
    } catch (error) {
      logger.error("Error al obtener contratos:", error);
      throw error;
    }
  }

  /**
   * Obtiene un contrato por su ID
   * @param id - ID del contrato
   * @param userId - ID del usuario que realiza la consulta
   * @param userRole - Rol del usuario
   */
  static async getContractById(id: string, userId?: string, userRole?: string) {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          documents: true,
          supplements: true,
          ContractAccess: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          ContractAccessRole: {
            include: {
              role: true,
            },
          },
          history: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!contract) {
        throw new NotFoundError(`Contrato con ID ${id} no encontrado`);
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasAccess = this.checkContractAccess(contract, userId);
        if (!hasAccess) {
          throw new AuthorizationError(
            "No tiene permiso para acceder a este contrato"
          );
        }
      }

      return this.mapContractToDTO(contract, true);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }
      logger.error(`Error al obtener contrato ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo contrato
   * @param contractData - Datos del nuevo contrato
   * @param userId - ID del usuario que crea el contrato
   */
  static async createContract(contractData: any, userId: string) {
    try {
      // Validación de datos
      this.validateContractData(contractData);

      // Crear el contrato
      const contract = await prisma.contract.create({
        data: {
          title: contractData.title,
          description: contractData.description,
          status: contractData.status || "draft",
          startDate: contractData.startDate
            ? new Date(contractData.startDate)
            : null,
          endDate: contractData.endDate ? new Date(contractData.endDate) : null,
          createdBy: {
            connect: { id: userId },
          },
          // Otros campos específicos del contrato
          // ...

          // Registrar en historial
          history: {
            create: {
              action: "CREATE",
              description: "Contrato creado",
              user: {
                connect: { id: userId },
              },
            },
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Contrato creado: ${contract.id} por usuario ${userId}`);
      return this.mapContractToDTO(contract);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      logger.error("Error al crear contrato:", error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ValidationError("Ya existe un contrato con estos datos");
        }
      }
      throw error;
    }
  }

  /**
   * Actualiza un contrato existente
   * @param id - ID del contrato
   * @param contractData - Datos actualizados
   * @param userId - ID del usuario que actualiza
   * @param userRole - Rol del usuario
   */
  static async updateContract(
    id: string,
    contractData: any,
    userId: string,
    userRole?: string
  ) {
    try {
      // Buscar el contrato
      const existingContract = await prisma.contract.findUnique({
        where: { id },
        include: {
          ContractAccess: true,
          ContractAccessRole: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!existingContract) {
        throw new NotFoundError(`Contrato con ID ${id} no encontrado`);
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasUpdateAccess = this.checkContractUpdateAccess(
          existingContract,
          userId
        );
        if (!hasUpdateAccess) {
          throw new AuthorizationError(
            "No tiene permiso para actualizar este contrato"
          );
        }
      }

      // Validar datos
      this.validateContractData(contractData, true);

      // Actualizar el contrato
      const contract = await prisma.contract.update({
        where: { id },
        data: {
          title: contractData.title,
          description: contractData.description,
          status: contractData.status,
          startDate: contractData.startDate
            ? new Date(contractData.startDate)
            : undefined,
          endDate: contractData.endDate ? new Date(contractData.endDate) : null,
          updatedAt: new Date(),
          // Otros campos específicos
          // ...

          // Registrar en historial
          history: {
            create: {
              action: "UPDATE",
              description: "Contrato actualizado",
              details: JSON.stringify(
                this.getChangedFields(existingContract, contractData)
              ),
              user: {
                connect: { id: userId },
              },
            },
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Contrato actualizado: ${id} por usuario ${userId}`);
      return this.mapContractToDTO(contract);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError ||
        error instanceof ValidationError
      ) {
        throw error;
      }

      logger.error(`Error al actualizar contrato ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un contrato
   * @param id - ID del contrato
   * @param status - Nuevo estado
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario
   */
  static async updateContractStatus(
    id: string,
    status: string,
    userId: string,
    userRole?: string
  ) {
    try {
      // Validar estado
      const validStatuses = [
        "draft",
        "pending_approval",
        "active",
        "expired",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Estado inválido: ${status}`);
      }

      // Buscar el contrato
      const existingContract = await prisma.contract.findUnique({
        where: { id },
        include: {
          ContractAccess: true,
          ContractAccessRole: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!existingContract) {
        throw new NotFoundError(`Contrato con ID ${id} no encontrado`);
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        // Para cambios de estado, verificar permiso especial de aprobación
        if (
          status === "active" &&
          existingContract.status === "pending_approval"
        ) {
          const hasApproveAccess = this.checkContractApproveAccess(
            existingContract,
            userId
          );
          if (!hasApproveAccess) {
            throw new AuthorizationError(
              "No tiene permiso para aprobar este contrato"
            );
          }
        } else {
          // Para otros cambios de estado, verificar permiso de actualización
          const hasUpdateAccess = this.checkContractUpdateAccess(
            existingContract,
            userId
          );
          if (!hasUpdateAccess) {
            throw new AuthorizationError(
              "No tiene permiso para actualizar este contrato"
            );
          }
        }
      }

      // Actualizar estado
      const contract = await prisma.contract.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),

          // Registrar en historial
          history: {
            create: {
              action: "STATUS_CHANGE",
              description: `Estado cambiado de ${existingContract.status} a ${status}`,
              user: {
                connect: { id: userId },
              },
            },
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(
        `Estado de contrato ${id} actualizado a ${status} por usuario ${userId}`
      );
      return this.mapContractToDTO(contract);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError ||
        error instanceof ValidationError
      ) {
        throw error;
      }

      logger.error(`Error al actualizar estado de contrato ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un contrato
   * @param id - ID del contrato
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario
   */
  static async deleteContract(id: string, userId: string, userRole?: string) {
    try {
      // Buscar el contrato
      const existingContract = await prisma.contract.findUnique({
        where: { id },
        include: {
          ContractAccess: true,
          ContractAccessRole: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!existingContract) {
        throw new NotFoundError(`Contrato con ID ${id} no encontrado`);
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin") {
        const hasDeleteAccess = this.checkContractDeleteAccess(
          existingContract,
          userId
        );
        if (!hasDeleteAccess) {
          throw new AuthorizationError(
            "No tiene permiso para eliminar este contrato"
          );
        }
      }

      // Eliminar contrato (podría ser una eliminación lógica)
      await prisma.contract.delete({
        where: { id },
      });

      logger.info(`Contrato ${id} eliminado por usuario ${userId}`);
      return { success: true };
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }

      logger.error(`Error al eliminar contrato ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza los permisos de acceso de un contrato
   * @param id - ID del contrato
   * @param accessControl - Configuración de acceso
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario
   */
  static async updateContractAccessControl(
    id: string,
    accessControl: any,
    userId: string,
    userRole?: string
  ) {
    try {
      // Buscar el contrato
      const existingContract = await prisma.contract.findUnique({
        where: { id },
      });

      if (!existingContract) {
        throw new NotFoundError(`Contrato con ID ${id} no encontrado`);
      }

      // Verificar permisos - solo admin o el creador pueden cambiar permisos
      if (userRole !== "Admin" && existingContract.createdById !== userId) {
        throw new AuthorizationError(
          "No tiene permiso para actualizar permisos de acceso"
        );
      }

      // Actualizar configuración de acceso
      const contract = await prisma.$transaction(async (prisma) => {
        // Si se cambia a acceso restringido, eliminamos los roles existentes
        if (accessControl.restricted) {
          await prisma.contractAccessRole.deleteMany({
            where: { contractId: id },
          });
        }
        // Si se proporcionan roles permitidos, actualizamos
        else if (
          accessControl.allowedRoles &&
          Array.isArray(accessControl.allowedRoles)
        ) {
          // Eliminar roles actuales
          await prisma.contractAccessRole.deleteMany({
            where: { contractId: id },
          });

          // Crear nuevas asignaciones de roles
          for (const roleId of accessControl.allowedRoles) {
            await prisma.contractAccessRole.create({
              data: {
                contractId: id,
                roleId,
              },
            });
          }
        }

        // Actualizar flag de acceso restringido en el contrato
        const updatedContract = await prisma.contract.update({
          where: { id },
          data: {
            accessRestricted: accessControl.restricted || false,
            updatedAt: new Date(),
            history: {
              create: {
                action: "ACCESS_CHANGE",
                description: `Configuración de acceso actualizada`,
                user: {
                  connect: { id: userId },
                },
              },
            },
          },
          include: {
            ContractAccessRole: {
              include: {
                role: true,
              },
            },
          },
        });

        return updatedContract;
      });

      logger.info(
        `Permisos de acceso actualizados para contrato ${id} por usuario ${userId}`
      );
      return this.mapContractToDTO(contract);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }

      logger.error(
        `Error al actualizar permisos de acceso de contrato ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Asigna usuarios a un contrato con permisos específicos
   * @param id - ID del contrato
   * @param userAssignments - Asignaciones de usuarios
   * @param userId - ID del usuario que hace la asignación
   * @param userRole - Rol del usuario
   */
  static async assignUsersToContract(
    id: string,
    userAssignments: Array<{
      userId: string;
      permissions: { [key: string]: boolean };
    }>,
    userId: string,
    userRole?: string
  ) {
    try {
      // Buscar el contrato
      const existingContract = await prisma.contract.findUnique({
        where: { id },
      });

      if (!existingContract) {
        throw new NotFoundError(`Contrato con ID ${id} no encontrado`);
      }

      // Verificar permisos
      if (userRole !== "Admin" && existingContract.createdById !== userId) {
        throw new AuthorizationError(
          "No tiene permiso para asignar usuarios a este contrato"
        );
      }

      // Procesar asignaciones de usuarios
      await prisma.$transaction(async (prisma) => {
        // Eliminar asignaciones actuales
        await prisma.contractAccess.deleteMany({
          where: { contractId: id },
        });

        // Crear nuevas asignaciones
        for (const assignment of userAssignments) {
          await prisma.contractAccess.create({
            data: {
              contractId: id,
              userId: assignment.userId,
              canRead: assignment.permissions.read || false,
              canUpdate: assignment.permissions.update || false,
              canDelete: assignment.permissions.delete || false,
              canApprove: assignment.permissions.approve || false,
              canAssign: assignment.permissions.assign || false,
            },
          });
        }

        // Registrar en historial
        await prisma.historyRecord.create({
          data: {
            contractId: id,
            action: "USER_ASSIGNMENT",
            description: `Usuarios asignados al contrato`,
            userId,
          },
        });
      });

      logger.info(`Usuarios asignados al contrato ${id} por usuario ${userId}`);

      // Obtener contrato actualizado con las nuevas asignaciones
      const updatedContract = await prisma.contract.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ContractAccess: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return this.mapContractToDTO(updatedContract);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }

      logger.error(`Error al asignar usuarios al contrato ${id}:`, error);
      throw error;
    }
  }

  /**
   * Valida los datos del contrato
   * @param data - Datos a validar
   * @param isUpdate - Indica si es una actualización
   */
  private static validateContractData(data: any, isUpdate: boolean = false) {
    const errors: Record<string, string> = {};

    if (!isUpdate || data.title !== undefined) {
      if (!data.title) {
        errors.title = "El título es obligatorio";
      } else if (data.title.length < 3) {
        errors.title = "El título debe tener al menos 3 caracteres";
      } else if (data.title.length > 200) {
        errors.title = "El título no puede exceder los 200 caracteres";
      }
    }

    if (
      data.description !== undefined &&
      data.description &&
      data.description.length > 1000
    ) {
      errors.description =
        "La descripción no puede exceder los 1000 caracteres";
    }

    if (data.status !== undefined) {
      const validStatuses = [
        "draft",
        "pending_approval",
        "active",
        "expired",
        "cancelled",
      ];
      if (!validStatuses.includes(data.status)) {
        errors.status = "Estado no válido";
      }
    }

    if (data.startDate !== undefined && data.startDate) {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        errors.startDate = "Fecha de inicio no válida";
      }
    }

    if (data.endDate !== undefined && data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        errors.endDate = "Fecha de fin no válida";
      }

      if (data.startDate) {
        const startDate = new Date(data.startDate);
        if (endDate < startDate) {
          errors.endDate =
            "La fecha de fin debe ser posterior a la fecha de inicio";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Error de validación", errors);
    }
  }

  /**
   * Verifica si un usuario tiene acceso de lectura a un contrato
   */
  private static checkContractAccess(contract: any, userId?: string): boolean {
    if (!userId) return false;

    // Si es el creador, tiene acceso
    if (contract.createdById === userId) return true;

    // Si tiene acceso explícito
    if (
      contract.ContractAccess?.some(
        (access) => access.userId === userId && access.canRead
      )
    ) {
      return true;
    }

    // Si pertenece a un rol con acceso
    if (
      contract.ContractAccessRole?.some((roleAccess) => {
        return roleAccess.role.users?.some((user) => user.id === userId);
      })
    ) {
      return true;
    }

    return false;
  }

  /**
   * Verifica si un usuario tiene acceso de actualización a un contrato
   */
  private static checkContractUpdateAccess(
    contract: any,
    userId?: string
  ): boolean {
    if (!userId) return false;

    // Si es el creador, puede actualizar
    if (contract.createdById === userId) return true;

    // Si tiene acceso explícito de actualización
    if (
      contract.ContractAccess?.some(
        (access) => access.userId === userId && access.canUpdate
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Verifica si un usuario tiene acceso de eliminación a un contrato
   */
  private static checkContractDeleteAccess(
    contract: any,
    userId?: string
  ): boolean {
    if (!userId) return false;

    // Si es el creador, puede eliminar
    if (contract.createdById === userId) return true;

    // Si tiene acceso explícito de eliminación
    if (
      contract.ContractAccess?.some(
        (access) => access.userId === userId && access.canDelete
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Verifica si un usuario tiene acceso de aprobación a un contrato
   */
  private static checkContractApproveAccess(
    contract: any,
    userId?: string
  ): boolean {
    if (!userId) return false;

    // Si tiene acceso explícito de aprobación
    if (
      contract.ContractAccess?.some(
        (access) => access.userId === userId && access.canApprove
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Obtiene los campos que han cambiado en una actualización
   */
  private static getChangedFields(
    oldData: any,
    newData: any
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    // Comparar campos básicos
    const fieldsToCheck = [
      "title",
      "description",
      "status",
      "startDate",
      "endDate",
    ];

    fieldsToCheck.forEach((field) => {
      if (newData[field] !== undefined && oldData[field] !== newData[field]) {
        changes[field] = {
          old: oldData[field],
          new: newData[field],
        };
      }
    });

    return changes;
  }

  /**
   * Convierte un objeto de contrato de la base de datos al formato DTO
   */
  private static mapContractToDTO(
    contract: any,
    includeDetails: boolean = false
  ): Contract {
    // Implementación dependerá de la estructura exacta de tu modelo
    // Este es un ejemplo simplificado
    const dto: any = {
      id: contract.id,
      title: contract.title,
      description: contract.description,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      createdById: contract.createdById,
    };

    if (contract.createdBy) {
      dto.createdBy = {
        id: contract.createdBy.id,
        name: contract.createdBy.name,
        email: contract.createdBy.email,
      };
    }

    if (includeDetails) {
      // Incluir detalles adicionales para vista detallada
      if (contract.documents) {
        dto.documents = contract.documents;
      }

      if (contract.supplements) {
        dto.supplements = contract.supplements;
      }

      if (contract.history) {
        dto.history = contract.history.map((h) => ({
          id: h.id,
          action: h.action,
          description: h.description,
          details: h.details ? JSON.parse(h.details) : undefined,
          date: h.createdAt,
          user: h.user
            ? {
                id: h.user.id,
                name: h.user.name,
              }
            : undefined,
        }));
      }

      // Acceso y roles
      dto.accessControl = {
        restricted: contract.accessRestricted || false,
        allowedRoles: contract.ContractAccessRole
          ? contract.ContractAccessRole.map((ar) => ({
              id: ar.role.id,
              name: ar.role.name,
            }))
          : [],
      };

      if (contract.ContractAccess) {
        dto.users = contract.ContractAccess.map((access) => ({
          id: access.user.id,
          name: access.user.name,
          email: access.user.email,
          permissions: {
            read: access.canRead,
            update: access.canUpdate,
            delete: access.canDelete,
            approve: access.canApprove,
            assign: access.canAssign,
          },
        }));
      }
    } else {
      // Para vista de lista, incluir solo usuarios básicos
      if (contract.ContractAccess) {
        dto.users = contract.ContractAccess.map((access) => ({
          id: access.user.id,
          name: access.user.name,
          email: access.user.email,
        }));
      }
    }

    return dto;
  }
}

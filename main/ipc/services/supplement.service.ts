import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { AppError } from "../../middleware/error.middleware";

export class SupplementService {
  /**
   * Crear nuevo suplemento para un contrato
   */
  static async createSupplement(data: any, userId: string) {
    try {
      // Verificar que el contrato existe
      const contract = await prisma.contract.findUnique({
        where: { id: data.contractId },
      });

      if (!contract) {
        throw AppError.notFound("Contrato no encontrado");
      }

      // Crear suplemento
      const supplement = await prisma.supplement.create({
        data: {
          ...data,
          createdById: userId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          contract: true,
        },
      });

      // Actualizar contrato si es necesario según los cambios del suplemento
      const changes = JSON.parse(supplement.changes || "{}");
      const updates: any = {};

      // Actualizar fecha de fin si cambió en el suplemento
      if (changes.endDate) {
        updates.endDate = new Date(changes.endDate.to);
      }

      // Actualizar valor si cambió en el suplemento
      if (changes.value) {
        updates.value = changes.value.to;
      }

      // Actualizar tipo si cambió en el suplemento
      if (changes.type) {
        updates.type = changes.type.to;
      }

      // Si hay cambios para actualizar en el contrato
      if (Object.keys(updates).length > 0) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: updates,
        });

        // Si cambió la fecha de fin, actualizar estado si es necesario
        if (updates.endDate) {
          const today = new Date();
          const warningDays = 30;
          const warningDate = new Date();
          warningDate.setDate(today.getDate() + warningDays);

          // Determinar nuevo estado
          let newStatus = "active";
          if (updates.endDate < today) {
            newStatus = "expired";
          } else if (updates.endDate < warningDate) {
            newStatus = "expiring_soon";
          }

          // Actualizar estado solo si debe cambiar
          if (newStatus !== contract.status) {
            await prisma.contract.update({
              where: { id: contract.id },
              data: { status: newStatus },
            });
          }
        }
      }

      // Registrar en historial
      await prisma.historyRecord.create({
        data: {
          entityType: "Supplement",
          entityId: supplement.id,
          userId,
          action: "CREATE",
          changes: supplement.changes,
          supplementId: supplement.id,
          contractId: contract.id,
        },
      });

      return supplement;
    } catch (error) {
      logger.error("Error creando suplemento:", error);
      throw error;
    }
  }

  /**
   * Obtener suplementos de un contrato
   */
  static async getContractSupplements(contractId: string) {
    try {
      return await prisma.supplement.findMany({
        where: { contractId },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { effectiveDate: "desc" },
      });
    } catch (error) {
      logger.error(
        `Error obteniendo suplementos para contrato ${contractId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtener suplemento por ID
   */
  static async getSupplementById(supplementId: string) {
    try {
      return await prisma.supplement.findUnique({
        where: { id: supplementId },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          contract: true,
        },
      });
    } catch (error) {
      logger.error(`Error obteniendo suplemento ${supplementId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un suplemento existente
   */
  static async updateSupplement(supplementId: string, data: any) {
    try {
      // Verificar que el suplemento existe
      const supplement = await prisma.supplement.findUnique({
        where: { id: supplementId },
      });

      if (!supplement) {
        throw AppError.notFound("Suplemento no encontrado");
      }

      // Actualizar el suplemento
      const updatedSupplement = await prisma.supplement.update({
        where: { id: supplementId },
        data,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          contract: true,
        },
      });

      return updatedSupplement;
    } catch (error) {
      logger.error(`Error actualizando suplemento ${supplementId}:`, error);
      throw error;
    }
  }

  /**
   * Aprueba un suplemento y aplica los cambios al contrato
   */
  static async approveSupplement(supplementId: string, userId: string) {
    try {
      // Verificar que el suplemento existe
      const supplement = await prisma.supplement.findUnique({
        where: { id: supplementId },
        include: { contract: true },
      });

      if (!supplement) {
        throw AppError.notFound("Suplemento no encontrado");
      }

      // Obtener los cambios definidos en el suplemento
      const changes = JSON.parse(supplement.changes || "{}");
      const contractUpdates: any = {};

      // Mapear los cambios al contrato
      Object.keys(changes).forEach((key) => {
        if (changes[key] && changes[key].to !== undefined) {
          contractUpdates[key] = changes[key].to;
        }
      });

      // Actualizar el contrato si hay cambios
      if (Object.keys(contractUpdates).length > 0) {
        await prisma.contract.update({
          where: { id: supplement.contractId },
          data: contractUpdates,
        });
      }

      // Marcar el suplemento como aprobado
      const approvedSupplement = await prisma.supplement.update({
        where: { id: supplementId },
        data: {
          isApproved: true,
          approvedById: userId,
          approvedAt: new Date(),
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          contract: true,
        },
      });

      // Crear notificación para el creador del suplemento
      if (supplement.createdById !== userId) {
        await prisma.userNotification.create({
          data: {
            userId: supplement.createdById,
            title: "Suplemento aprobado",
            message: `Su suplemento para el contrato ${supplement.contract.contractNumber} ha sido aprobado`,
            type: "success",
            contractId: supplement.contractId,
          },
        });
      }

      return approvedSupplement;
    } catch (error) {
      logger.error(`Error aprobando suplemento ${supplementId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un suplemento existente que no ha sido aprobado
   */
  static async deleteSupplement(supplementId: string, userId: string) {
    try {
      // Verificar que el suplemento existe
      const supplement = await prisma.supplement.findUnique({
        where: { id: supplementId },
        include: { contract: true },
      });

      if (!supplement) {
        throw AppError.notFound("Suplemento no encontrado");
      }

      // Verificar que el suplemento no ha sido aprobado
      if (supplement.isApproved) {
        throw AppError.forbidden(
          "No se puede eliminar un suplemento que ya ha sido aprobado"
        );
      }

      // Verificar que el usuario es el creador o tiene acceso al contrato
      const userHasAccess = await prisma.contractAccess.findFirst({
        where: {
          userId,
          contractId: supplement.contractId,
          permissions: { contains: '"delete"' },
        },
      });

      const isCreator = supplement.createdById === userId;

      if (!isCreator && !userHasAccess) {
        throw AppError.forbidden(
          "No tienes permisos para eliminar este suplemento"
        );
      }

      // Registrar en historial antes de eliminar
      await prisma.historyRecord.create({
        data: {
          entityType: "Supplement",
          entityId: supplementId,
          userId,
          action: "DELETE",
          changes: JSON.stringify({
            message: "Suplemento eliminado",
            supplementTitle: supplement.title,
            contractId: supplement.contractId,
            contractNumber: supplement.contract.contractNumber,
          }),
          contractId: supplement.contractId,
        },
      });

      // Eliminar el suplemento
      await prisma.supplement.delete({
        where: { id: supplementId },
      });

      return { success: true, message: "Suplemento eliminado con éxito" };
    } catch (error) {
      logger.error(`Error eliminando suplemento ${supplementId}:`, error);
      throw error;
    }
  }
}

import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ErrorHandler } from "../utils/error-handler";

/**
 * Servicio para manejar operaciones CRUD de contratos
 */
export class ContractService {
  /**
   * Obtiene todos los contratos con filtros opcionales
   * @param filters - Filtros opcionales para los contratos
   * @param userId - ID del usuario que realiza la consulta
   * @param userRole - Rol del usuario
   */
  static async getContracts(filters?: any, userId?: string, userRole?: string) {
    try {
      // Construir las condiciones de filtrado
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.startDate) {
        where.startDate = {
          gte: new Date(filters.startDate),
        };
      }

      if (filters?.endDate) {
        where.endDate = {
          lte: new Date(filters.endDate),
        };
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
        ];
      }

      // Si no es administrador, mostrar solo contratos que ha creado
      if (userRole !== "Admin") {
        where.createdById = userId;
      }

      // Obtener los contratos con sus relaciones
      const contracts = await prisma.contract.findMany({
        select: {
          id: true,
          contractNumber: true,
          status: true,
          startDate: true,
          endDate: true,
          companyName: true,
          companyAddress: true,
        },
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // Limitar resultados para paginación
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
        select: {
          id: true,
          contractNumber: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          companyName: true,
          companyAddress: true,
          createdById: true,
          documents: {
            select: {
              id: true,
              name: true,
            },
            take: 10,
          },
          supplements: {
            select: {
              id: true,
              createdAt: true,
              effectiveDate: true,
              isApproved: true,
            },
            take: 10,
          },
        },
      });

      if (!contract) {
        throw ErrorHandler.createError(
          "NotFoundError",
          `Contrato con ID ${id} no encontrado`
        );
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin" && contract.createdById !== userId) {
        throw ErrorHandler.createError(
          "AuthorizationError",
          "No tiene permiso para acceder a este contrato"
        );
      }

      return this.mapContractToDTO(contract, true);
    } catch (error) {
      if (error instanceof ErrorHandler) {
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

      // Generar número de contrato único
      const contractNumber = `CTR-${Date.now().toString().slice(-6)}`;

      // Crear el contrato
      const contract = await prisma.contract.create({
        data: {
          contractNumber,
          description: contractData.description || "",
          companyName: contractData.companyName || "",
          companyAddress: contractData.companyAddress,
          nationality: contractData.nationality || "",
          commercialAuth: contractData.commercialAuth || "",
          bankAccount: contractData.bankAccount || "",
          bankBranch: contractData.bankBranch || "",
          bankAgency: contractData.bankAgency || "",
          bankHolder: contractData.bankHolder || "",
          bankCurrency: contractData.bankCurrency || "CUP",
          reeupCode: contractData.reeupCode || "",
          nit: contractData.nit || "",
          contactPhones: contractData.contactPhones || "[]",
          repName: contractData.repName || "",
          repPosition: contractData.repPosition || "",
          repDocumentType: contractData.repDocumentType || "",
          repDocumentNumber: contractData.repDocumentNumber || "",
          repDocumentDate: new Date(),
          providerObligations: contractData.providerObligations || "[]",
          clientObligations: contractData.clientObligations || "[]",
          deliveryPlace: contractData.deliveryPlace || "",
          deliveryTerm: contractData.deliveryTerm || "",
          acceptanceProcedure: contractData.acceptanceProcedure || "",
          value: contractData.value || 0,
          currency: contractData.currency || "CUP",
          paymentMethod: contractData.paymentMethod || "",
          paymentTerm: contractData.paymentTerm || "",
          warrantyTerm: contractData.warrantyTerm || "",
          warrantyScope: contractData.warrantyScope || "",
          technicalStandards: contractData.technicalStandards || "",
          claimProcedure: contractData.claimProcedure || "",
          disputeResolution: contractData.disputeResolution || "",
          latePaymentInterest: contractData.latePaymentInterest || "",
          breachPenalties: contractData.breachPenalties || "",
          notificationMethods: contractData.notificationMethods || "[]",
          minimumNoticeTime: contractData.minimumNoticeTime || "",
          startDate: new Date(contractData.startDate),
          endDate: contractData.endDate
            ? new Date(contractData.endDate)
            : new Date(),
          extensionTerms: contractData.extensionTerms || "",
          earlyTerminationNotice: contractData.earlyTerminationNotice || "",
          forceMajeure: contractData.forceMajeure || "",
          status: contractData.status || "draft",
          type: contractData.type || "general",
          signDate: new Date(),
          signPlace: contractData.signPlace || "",
          createdById: userId,
          ownerId: userId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Registrar en historial de forma separada después de crear el contrato
      await prisma.historyRecord.create({
        data: {
          action: "CREATE",
          entityType: "Contract",
          entityId: contract.id,
          contractId: contract.id,
          userId: userId,
          details: "Contrato creado",
        },
      });

      logger.info(`Contrato creado: ${contract.id} por usuario ${userId}`);
      return this.mapContractToDTO(contract);
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }

      logger.error("Error al crear contrato:", error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw ErrorHandler.createError(
            "ValidationError",
            "Ya existe un contrato con estos datos"
          );
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
      });

      if (!existingContract) {
        throw ErrorHandler.createError(
          "NotFoundError",
          `Contrato con ID ${id} no encontrado`
        );
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin" && existingContract.createdById !== userId) {
        throw ErrorHandler.createError(
          "AuthorizationError",
          "No tiene permiso para actualizar este contrato"
        );
      }

      // Validar datos
      this.validateContractData(contractData, true);

      // Obtener campos cambiados para el historial
      const changedFields = this.getChangedFields(
        existingContract,
        contractData
      );

      // Actualizar el contrato
      const contract = await prisma.contract.update({
        where: { id },
        data: {
          contractNumber: contractData.contractNumber,
          description: contractData.description,
          companyName: contractData.companyName,
          companyAddress: contractData.companyAddress,
          startDate: contractData.startDate
            ? new Date(contractData.startDate)
            : undefined,
          endDate: contractData.endDate
            ? new Date(contractData.endDate)
            : new Date(),
          status: contractData.status,
          type: contractData.type,
          signPlace: contractData.signPlace,
          paymentMethod: contractData.paymentMethod,
          paymentTerm: contractData.paymentTerm,
          value: contractData.value,
          updatedAt: new Date(),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Registrar en historial de forma separada
      const changes =
        Object.keys(changedFields).length > 0
          ? JSON.stringify(changedFields)
          : null;
      await prisma.historyRecord.create({
        data: {
          action: "UPDATE",
          entityType: "Contract",
          entityId: contract.id,
          contractId: contract.id,
          userId: userId,
          changes: changes,
          details: "Contrato actualizado",
        },
      });

      logger.info(`Contrato actualizado: ${id} por usuario ${userId}`);
      return this.mapContractToDTO(contract);
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }

      logger.error(`Error al actualizar contrato ${id}:`, error);
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
      });

      if (!existingContract) {
        throw ErrorHandler.createError(
          "NotFoundError",
          `Contrato con ID ${id} no encontrado`
        );
      }

      // Verificar permisos si no es admin
      if (userRole !== "Admin" && existingContract.createdById !== userId) {
        throw ErrorHandler.createError(
          "AuthorizationError",
          "No tiene permiso para eliminar este contrato"
        );
      }

      // Antes de eliminar, registrar la acción en el historial
      await prisma.historyRecord.create({
        data: {
          action: "DELETE",
          entityType: "Contract",
          entityId: id,
          contractId: id,
          userId: userId,
          details: "Contrato eliminado",
        },
      });

      // Eliminar contrato
      await prisma.contract.delete({
        where: { id },
      });

      logger.info(`Contrato ${id} eliminado por usuario ${userId}`);
      return { success: true, message: "Contrato eliminado correctamente" };
    } catch (error) {
      if (error instanceof ErrorHandler) {
        throw error;
      }

      logger.error(`Error al eliminar contrato ${id}:`, error);
      throw error;
    }
  }

  /**
   * Valida los datos del contrato
   * @param data - Datos a validar
   * @param isUpdate - Indica si es una actualización
   */
  private static validateContractData(data: any, isUpdate: boolean = false) {
    const errors: { [key: string]: string } = {};

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

    if (!isUpdate && !data.startDate) {
      errors.startDate = "La fecha de inicio es obligatoria";
    } else if (data.startDate !== undefined && data.startDate) {
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

    if (!isUpdate && !data.companyName) {
      errors.companyName = "El nombre de la empresa es obligatorio";
    }

    if (Object.keys(errors).length > 0) {
      throw ErrorHandler.createError(
        "ValidationError",
        "Error de validación",
        JSON.stringify(errors)
      );
    }
  }

  /**
   * Obtiene los campos que han cambiado en una actualización
   */
  private static getChangedFields(
    oldData: any,
    newData: any
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    // Campos a verificar
    const fieldsToCheck = [
      "title",
      "description",
      "status",
      "startDate",
      "endDate",
      "companyName",
      "companyAddress",
      "parties",
      "type",
      "paymentMethod",
      "paymentTerm",
      "amount",
      "value",
    ];

    fieldsToCheck.forEach((field) => {
      if (newData[field] !== undefined && oldData[field] !== newData[field]) {
        if (field === "startDate" || field === "endDate") {
          // Formatear fechas para comparación
          const oldDate = oldData[field]
            ? new Date(oldData[field]).toISOString().split("T")[0]
            : null;
          const newDate = newData[field]
            ? new Date(newData[field]).toISOString().split("T")[0]
            : null;

          if (oldDate !== newDate) {
            changes[field] = {
              old: oldDate,
              new: newDate,
            };
          }
        } else {
          changes[field] = {
            old: oldData[field],
            new: newData[field],
          };
        }
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
  ): any {
    if (!contract) return null;

    // Datos básicos del contrato
    const contractDTO = {
      id: contract.id,
      contractNumber: contract.contractNumber,
      title: contract.title,
      description: contract.description,
      parties: contract.parties,
      companyName: contract.companyName,
      companyAddress: contract.companyAddress,
      status: contract.status,
      type: contract.type,
      startDate: contract.startDate,
      endDate: contract.endDate,
      signDate: contract.signDate,
      signPlace: contract.signPlace,
      paymentMethod: contract.paymentMethod,
      paymentTerm: contract.paymentTerm,
      amount: contract.amount,
      value: contract.value,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      createdBy: contract.createdBy
        ? {
            id: contract.createdBy.id,
            name: contract.createdBy.name,
            email: contract.createdBy.email,
          }
        : null,
      owner: contract.owner
        ? {
            id: contract.owner.id,
            name: contract.owner.name,
            email: contract.owner.email,
          }
        : null,
    };

    // Si se solicitan detalles, agregar información adicional
    if (includeDetails) {
      return {
        ...contractDTO,
        documents: contract.documents || [],
        supplements: (contract.supplements || []).map((supplement: any) => ({
          id: supplement.id,
          title: supplement.title,
          description: supplement.description,
          effectiveDate: supplement.effectiveDate,
          isApproved: supplement.isApproved,
          createdAt: supplement.createdAt,
        })),
        history: (contract.history || []).map((record: any) => ({
          id: record.id,
          action: record.action,
          changes: record.changes,
          timestamp: record.timestamp,
          user: record.user
            ? {
                id: record.user.id,
                name: record.user.name,
                email: record.user.email,
              }
            : null,
        })),
      };
    }

    return contractDTO;
  }

  /**
   * Actualiza el control de acceso de un contrato
   */
  static async updateContractAccessControl(
    id: string,
    accessControl: any,
    userId: string,
    userRole: string
  ) {
    // TODO: Implementar la lógica para actualizar el control de acceso
    return { success: true };
  }

  /**
   * Asigna usuarios a un contrato
   */
  static async assignUsersToContract(
    id: string,
    userAssignments: any,
    userId: string,
    userRole: string
  ) {
    // TODO: Implementar la lógica para asignar usuarios
    return { success: true };
  }

  /**
   * Actualiza el estado de un contrato
   * @param contractId - ID del contrato
   * @param newStatus - Nuevo estado
   * @param userId - ID del usuario que realiza la acción
   */
  static async updateContractStatus(
    contractId: string,
    newStatus: "Vigente" | "Próximo a Vencer" | "Vencido" | "Archivado",
    userId: string
  ) {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          supplements: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!contract) {
        throw new Error("Contrato no encontrado");
      }

      // Validar transiciones de estado
      const validTransitions: Record<string, string[]> = {
        Vigente: ["Próximo a Vencer", "Vencido", "Archivado"],
        "Próximo a Vencer": ["Vigente", "Vencido", "Archivado"],
        Vencido: ["Archivado"],
        Archivado: ["Vigente"],
      };

      if (!validTransitions[contract.status]?.includes(newStatus)) {
        throw new Error(
          `Transición de estado no válida: ${contract.status} -> ${newStatus}`
        );
      }

      // Si se está desarchivando, verificar que haya un suplemento válido
      if (contract.status === "Archivado" && newStatus === "Vigente") {
        const lastSupplement = contract.supplements[0];
        if (
          !lastSupplement ||
          new Date(lastSupplement.effectiveDate) <= new Date()
        ) {
          throw new Error(
            "No se puede desarchivar un contrato sin suplemento válido"
          );
        }
      }

      const updatedContract = await prisma.contract.update({
        where: { id: contractId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      // Registrar en el historial
      await prisma.historyRecord.create({
        data: {
          contractId,
          action: `Estado actualizado a ${newStatus}`,
          userId,
          details: `Cambio de estado: ${contract.status} -> ${newStatus}`,
          entityType: "Contract",
          entityId: contractId,
        },
      });

      return updatedContract;
    } catch (error) {
      console.error("Error al actualizar estado del contrato:", error);
      throw error;
    }
  }

  /**
   * Verifica y actualiza automáticamente los estados de los contratos
   */
  static async checkAndUpdateContractStatuses() {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      // Actualizar contratos vencidos
      await prisma.contract.updateMany({
        where: {
          status: "Vigente",
          endDate: {
            lt: today,
          },
        },
        data: {
          status: "Vencido",
        },
      });

      // Actualizar contratos próximos a vencer
      await prisma.contract.updateMany({
        where: {
          status: "Vigente",
          endDate: {
            gte: today,
            lte: thirtyDaysFromNow,
          },
        },
        data: {
          status: "Próximo a Vencer",
        },
      });

      // Archivar contratos vencidos automáticamente después de 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      await prisma.contract.updateMany({
        where: {
          status: "Vencido",
          endDate: {
            lt: thirtyDaysAgo,
          },
        },
        data: {
          status: "Archivado",
        },
      });
    } catch (error) {
      console.error("Error al actualizar estados de contratos:", error);
      throw error;
    }
  }
}

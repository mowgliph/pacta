import { prisma } from "../lib/prisma";
import { withErrorHandling } from "../utils/setup";
import { logger } from "../utils/logger";
import { ContractService } from "../services/contract.service";
import { ContractsChannels } from "../channels/contracts.channels";
import { ErrorHandler } from "../utils/error-handler";
import { ipcMain } from "electron";
import { ValidationService } from "../validations";

export function setupContractHandlers(): void {
  const validationService = ValidationService.getInstance();

  // Obtener todos los contratos
  withErrorHandling(ContractsChannels.GET_ALL, async (_, filters) => {
    try {
      // Validar filtros
      validationService.validateContract(filters);

      const contracts = await ContractService.getContracts(filters);
      return { contracts };
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error al obtener contratos:", error);
        throw ErrorHandler.createError("DatabaseError", error.message);
      }
      throw error;
    }
  });

  // Obtener un contrato por ID
  withErrorHandling(
    ContractsChannels.GET_BY_ID,
    async (_, { id, includeDocuments = false }) => {
      try {
        if (!id || typeof id !== "string") {
          throw ErrorHandler.createError(
            "ValidationError",
            "ID de contrato no válido"
          );
        }

        const contract = await ContractService.getContractById(
          id,
          includeDocuments
        );
        return { contract };
      } catch (error) {
        logger.error(`Error al obtener contrato ${id}:`, error);
        throw error;
      }
    }
  );

  // Crear un nuevo contrato
  withErrorHandling(ContractsChannels.CREATE, async (_, { data, userId }) => {
    try {
      // Validar datos del contrato
      validationService.validateContract(data);

      const contract = await ContractService.createContract(data, userId);
      return {
        success: true,
        contract,
        message: "Contrato creado exitosamente",
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error al crear contrato:", error);
        throw ErrorHandler.createError("DatabaseError", error.message);
      }
      throw error;
    }
  });

  // Actualizar un contrato
  withErrorHandling(
    ContractsChannels.UPDATE,
    async (_, { id, data, userId, userRole }) => {
      try {
        // Validar datos de actualización
        validationService.validateContract(data);

        const contract = await ContractService.updateContract(
          id,
          data,
          userId,
          userRole
        );
        return {
          success: true,
          contract,
          message: "Contrato actualizado exitosamente",
        };
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error al actualizar contrato ${id}:`, error);
          throw ErrorHandler.createError("DatabaseError", error.message);
        }
        throw error;
      }
    }
  );

  // Eliminar un contrato
  withErrorHandling(ContractsChannels.DELETE, async (_, { id, userId }) => {
    try {
      // Validar ID
      if (!id || typeof id !== "string" || !userId) {
        throw ErrorHandler.createError(
          "ValidationError",
          "ID de contrato y usuario son requeridos"
        );
      }

      // Iniciar transacción para operación atómica
      await prisma.$transaction(async (tx) => {
        // Eliminar partes relacionadas
        await tx.contractAccess.deleteMany({
          where: { contractId: id },
        });

        // Eliminar historial
        await tx.historyRecord.deleteMany({
          where: {
            entityId: id,
            entityType: "Contract",
          },
        });

        // Eliminar contrato
        await tx.contract.delete({
          where: { id },
        });
      });

      // Crear registro de historial independiente
      await prisma.historyRecord.create({
        data: {
          action: "DELETE",
          userId,
          entityType: "Contract",
          entityId: id,
          details: "Contrato eliminado",
        },
      });

      logger.info(`Contrato eliminado: ${id}`);
      return {
        success: true,
        message: "Contrato eliminado exitosamente",
      };
    } catch (error) {
      if (error.type === "ValidationError") {
        throw error;
      }
      if (error.code === "P2025") {
        throw ErrorHandler.createError(
          "NotFoundError",
          "Contrato no encontrado"
        );
      }
      logger.error(`Error al eliminar contrato ${id}:`, error);
      throw ErrorHandler.createError(
        "DatabaseError",
        "Error al eliminar el contrato"
      );
    }
  });

  // Actualizar control de acceso de un contrato
  withErrorHandling(
    ContractsChannels.UPDATE_ACCESS,
    async (_, { id, accessControl, userId, userRole }) => {
      try {
        if (!id || !userId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "ID de contrato y usuario son requeridos"
          );
        }

        const result = await ContractService.updateContractAccessControl(
          id,
          accessControl,
          userId,
          userRole
        );

        logger.info(`Control de acceso actualizado para contrato: ${id}`);
        return {
          success: true,
          ...Object.fromEntries(
            Object.entries(result).filter(([k]) => k !== "success")
          ),
          message: "Control de acceso actualizado",
        };
      } catch (error) {
        logger.error(
          `Error al actualizar control de acceso para contrato ${id}:`,
          error
        );
        throw error;
      }
    }
  );

  // Asignar usuarios a un contrato
  withErrorHandling(
    ContractsChannels.ASSIGN_USERS,
    async (_, { id, userAssignments, userId, userRole }) => {
      try {
        if (!id || !userId || !userAssignments) {
          throw ErrorHandler.createError(
            "ValidationError",
            "Datos incompletos para asignación de usuarios"
          );
        }

        const result = await ContractService.assignUsersToContract(
          id,
          userAssignments,
          userId,
          userRole
        );

        logger.info(`Usuarios asignados a contrato: ${id}`);
        return {
          success: true,
          ...Object.fromEntries(
            Object.entries(result).filter(([k]) => k !== "success")
          ),
          message: "Usuarios asignados correctamente",
        };
      } catch (error) {
        logger.error(`Error al asignar usuarios a contrato ${id}:`, error);
        throw error;
      }
    }
  );

  // Handler para actualizar estado de contrato
  ipcMain.handle(
    "contracts:update-status",
    async (event, { contractId, newStatus, userId }) => {
      try {
        const updatedContract = await ContractService.updateContractStatus(
          contractId,
          newStatus,
          userId
        );
        return { success: true, contract: updatedContract };
      } catch (error) {
        console.error("Error al actualizar estado del contrato:", error);
        return { success: false, error: error.message };
      }
    }
  );

  // Handler para verificación automática de estados
  ipcMain.handle("contracts:check-statuses", async () => {
    try {
      await ContractService.checkAndUpdateContractStatuses();
      return { success: true };
    } catch (error) {
      console.error("Error al verificar estados de contratos:", error);
      return { success: false, error: error.message };
    }
  });
}

import { withErrorHandling } from "../utils/setup";
import { logger } from "../utils/logger";
import { SupplementService } from "../services/supplement.service";
import { SupplementsChannels } from "../channels/supplements.channels";
import { ErrorHandler } from "../utils/error-handler";
import { ipcMain } from "electron";
import { ValidationService } from "../validations";
import { createHistoryRecord } from "../utils/history.utils";
import { NotificationService } from "../services/notification.service";
import { checkPermissions } from "../middleware/auth.middleware";
import {
  NotificationType,
  NotificationPriority,
} from "../channels/notifications.channels";
import { z } from "zod";

const notificationService = NotificationService.getInstance();
const supplementService = new SupplementService();

export function setupSupplementHandlers(): void {
  const validationService = ValidationService.getInstance();

  // Obtener todos los suplementos
  withErrorHandling(SupplementsChannels.GET_ALL, async (_, filters) => {
    try {
      // Validar filtros
      validationService.validateSupplement(filters);

      const supplements = await supplementService.getAllSupplements(
        filters.contractId
      );
      return { supplements };
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error al obtener suplementos:", error);
        throw ErrorHandler.createError("DatabaseError", error.message);
      }
      throw error;
    }
  });

  // Obtener un suplemento por ID
  withErrorHandling(
    SupplementsChannels.GET_BY_ID,
    async (_, { id, includeDocuments = false }) => {
      try {
        if (!id || typeof id !== "string") {
          throw ErrorHandler.createError(
            "ValidationError",
            "ID de suplemento no válido"
          );
        }

        const supplement = await supplementService.getSupplementById(id);
        return { supplement };
      } catch (error) {
        logger.error(`Error al obtener suplemento ${id}:`, error);
        throw error;
      }
    }
  );

  // Crear un nuevo suplemento
  withErrorHandling(SupplementsChannels.CREATE, async (_, data) => {
    try {
      // Validar datos del suplemento
      validationService.validateSupplement(data);

      const supplement = await supplementService.createSupplement(data);
      return {
        success: true,
        supplement,
        message: "Suplemento creado exitosamente",
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error al crear suplemento:", error);
        throw ErrorHandler.createError("DatabaseError", error.message);
      }
      throw error;
    }
  });

  // Actualizar un suplemento
  withErrorHandling(SupplementsChannels.UPDATE, async (_, { id, data }) => {
    try {
      // Validar datos de actualización
      validationService.validateSupplement(data);

      const supplement = await supplementService.updateSupplement(id, data);
      return {
        success: true,
        supplement,
        message: "Suplemento actualizado exitosamente",
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error al actualizar suplemento ${id}:`, error);
        throw ErrorHandler.createError("DatabaseError", error.message);
      }
      throw error;
    }
  });
}

// Esquema de validación para aprobar suplementos
const approveSupplementSchema = z.object({
  supplementId: z.string().uuid(),
  approvedById: z.string().uuid(),
});

// Handler para obtener suplementos de un contrato
ipcMain.handle("supplements:getByContract", async (_, contractId) => {
  try {
    const supplements = await supplementService.getAllSupplements(contractId);
    return { success: true, data: supplements };
  } catch (error) {
    console.error("Error al obtener suplementos:", error);
    return { success: false, error: error.message };
  }
});

// Handler para aprobar un suplemento
ipcMain.handle("supplements:approve", async (_, data, userId) => {
  try {
    const validatedData = approveSupplementSchema.parse(data);

    const supplement = await supplementService.approveSupplement(
      validatedData.supplementId,
      validatedData.approvedById
    );

    // Registrar en el historial
    await createHistoryRecord({
      entityType: "Supplement",
      entityId: supplement.id,
      userId,
      action: "APPROVE",
      details: `Suplemento aprobado para el contrato ${supplement.contractId}`,
      changes: JSON.stringify(validatedData),
      contractId: supplement.contractId,
    });

    // Notificar al usuario que creó el suplemento
    await notificationService.createNotification({
      userId: supplement.createdById,
      title: "Suplemento aprobado",
      message: `El suplemento ${supplement.id} ha sido aprobado`,
      type: NotificationType.SUPPLEMENT,
      priority: NotificationPriority.HIGH,
      metadata: {
        supplementId: supplement.id,
        contractId: supplement.contractId,
      },
    });

    // Notificar al aprobador
    await notificationService.createNotification({
      userId: validatedData.approvedById,
      title: "Suplemento Aprobado",
      message: `Has aprobado el suplemento "${supplement.title}"`,
      type: NotificationType.SUPPLEMENT,
      priority: NotificationPriority.HIGH,
      metadata: {
        supplementId: supplement.id,
        contractId: supplement.contractId,
      },
    });

    return { success: true, data: supplement };
  } catch (error) {
    console.error("Error al aprobar suplemento:", error);
    return { success: false, error: error.message };
  }
});

// Handler para obtener suplementos pendientes
ipcMain.handle("supplements:getPending", async () => {
  try {
    const supplements = await supplementService.getPendingSupplements();
    return { success: true, data: supplements };
  } catch (error) {
    console.error("Error al obtener suplementos pendientes:", error);
    return { success: false, error: error.message };
  }
});

// Handler para buscar suplementos
ipcMain.handle("supplements:search", async (_, query) => {
  try {
    const supplements = await supplementService.searchSupplements(query);
    return { success: true, data: supplements };
  } catch (error) {
    console.error("Error al buscar suplementos:", error);
    return { success: false, error: error.message };
  }
});

// Handler para eliminar un suplemento
ipcMain.handle("supplements:delete", async (_, supplementId, userId) => {
  try {
    const supplement = await supplementService.getSupplementById(supplementId);

    if (!supplement) {
      throw new Error("Suplemento no encontrado");
    }

    await supplementService.deleteSupplement(supplementId);

    // Registrar en el historial
    await createHistoryRecord({
      entityType: "Supplement",
      entityId: supplementId,
      userId,
      action: "DELETE",
      details: `Suplemento eliminado para el contrato ${supplement.contractId}`,
      contractId: supplement.contractId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar suplemento:", error);
    return { success: false, error: error.message };
  }
});

// Handler para rechazar un suplemento
ipcMain.handle("supplements:reject", async (_, supplementId, userId) => {
  try {
    // Validar permisos
    await checkPermissions(userId, "contracts", "approve");

    // Verificar que el suplemento existe
    const supplement = await supplementService.findById(supplementId);
    if (!supplement) {
      throw ErrorHandler.createError(
        "NotFoundError",
        "Suplemento no encontrado"
      );
    }

    // Rechazar suplemento
    const rejectedSupplement = await supplementService.reject(supplementId);

    // Registrar en el historial
    await createHistoryRecord({
      entityType: "Supplement",
      entityId: supplementId,
      userId,
      action: "REJECT",
      details: `Suplemento rechazado`,
      contractId: supplement.contractId,
    });

    // Notificar al usuario que creó el suplemento
    if (supplement.createdById) {
      await notificationService.createNotification({
        userId: supplement.createdById,
        title: "Suplemento rechazado",
        message: `El suplemento ${supplement.id} ha sido rechazado`,
        type: NotificationType.SUPPLEMENT,
        priority: NotificationPriority.HIGH,
        metadata: {
          supplementId: supplement.id,
          contractId: supplement.contractId,
        },
      });
    }

    return { success: true, data: rejectedSupplement };
  } catch (error) {
    console.error("Error al rechazar suplemento:", error);
    return { success: false, error: error.message };
  }
});

import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ipcMain } from "electron";
import { createHistoryRecord } from "../utils/history.utils";
import { SupplementService } from "../services/supplement.service";
import { NotificationService } from "../services/notification.service";
import { checkPermissions } from "../middleware/auth.middleware";
import { ErrorHandler } from "../utils/error-handler";
import {
  NotificationType,
  NotificationPriority,
} from "../channels/notifications.channels";

const supplementService = new SupplementService();
const notificationService = NotificationService.getInstance();

// Esquema de validación para crear suplementos
const createSupplementSchema = z.object({
  contractId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  changes: z.string().min(1),
  effectiveDate: z.string().transform((str) => new Date(str)),
  documentUrl: z.string().optional(),
  changeType: z.enum([
    "extension",
    "modification",
    "termination",
    "price_adjustment",
    "scope_change",
    "force_majeure",
  ]),
});

// Esquema de validación para aprobar suplementos
const approveSupplementSchema = z.object({
  supplementId: z.string().uuid(),
  approvedById: z.string().uuid(),
});

// Handler para crear un nuevo suplemento
ipcMain.handle("supplements:create", async (_, data, userId) => {
  try {
    // Validar permisos
    await checkPermissions(userId, "contracts", "update");

    // Validar datos de entrada
    const validatedData = createSupplementSchema.parse(data);

    // Verificar que el contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id: validatedData.contractId },
      include: { owner: true },
    });

    if (!contract) {
      throw ErrorHandler.createError("NotFoundError", "Contrato no encontrado");
    }

    // Crear el suplemento
    const supplement = await supplementService.createSupplement({
      contractId: validatedData.contractId,
      title: validatedData.title,
      description: validatedData.description || null,
      changes: validatedData.changes,
      effectiveDate: validatedData.effectiveDate,
      documentUrl: validatedData.documentUrl || null,
      createdById: userId,
      isApproved: false,
      approvedById: null,
      createdBy: { connect: { id: userId } },
      contract: { connect: { id: validatedData.contractId } },
    });

    // Registrar en el historial
    await createHistoryRecord({
      entityType: "Supplement",
      entityId: supplement.id,
      userId,
      action: "CREATE",
      details: `Suplemento creado para el contrato ${contract.contractNumber}`,
      changes: JSON.stringify(validatedData),
      contractId: contract.id,
    });

    // Crear notificación para el dueño del contrato
    if (contract.owner) {
      await notificationService.createNotification({
        userId: contract.owner.id,
        title: "Nuevo suplemento para revisar",
        message: `Se ha creado un nuevo suplemento para el contrato ${contract.contractNumber}`,
        type: NotificationType.SUPPLEMENT,
        priority: NotificationPriority.MEDIUM,
        metadata: {
          supplementId: supplement.id,
          contractId: supplement.contractId,
        },
      });
    }

    return { success: true, data: supplement };
  } catch (error) {
    console.error("Error al crear suplemento:", error);
    return { success: false, error: error.message };
  }
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

// Handler para actualizar un suplemento
ipcMain.handle("supplements:update", async (_, data, userId) => {
  try {
    // Validar permisos
    await checkPermissions(userId, "contracts", "update");

    const { id, ...updateData } = data;

    // Verificar que el suplemento existe y no está aprobado
    const existingSupplement = await supplementService.findById(id);
    if (!existingSupplement) {
      throw ErrorHandler.createError(
        "NotFoundError",
        "Suplemento no encontrado"
      );
    }

    if (existingSupplement.isApproved) {
      throw ErrorHandler.createError(
        "ValidationError",
        "No se puede modificar un suplemento aprobado"
      );
    }

    // Actualizar suplemento
    const supplement = await supplementService.update(id, updateData);

    // Registrar en el historial
    await createHistoryRecord({
      entityType: "Supplement",
      entityId: id,
      userId,
      action: "UPDATE",
      details: `Suplemento actualizado`,
      changes: JSON.stringify(updateData),
      contractId: supplement.contractId,
    });

    return { success: true, data: supplement };
  } catch (error) {
    console.error("Error al actualizar suplemento:", error);
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

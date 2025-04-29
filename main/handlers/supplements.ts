import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ipcMain } from "electron";
import { createHistoryRecord } from "../utils/history.utils";
import { SupplementService } from "../services/supplement.service";

const supplementService = new SupplementService();

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
    // Validar datos de entrada
    const validatedData = createSupplementSchema.parse(data);

    // Verificar que el contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id: validatedData.contractId },
    });

    if (!contract) {
      throw new Error("Contrato no encontrado");
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

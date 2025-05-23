const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const {
  SupplementSchema,
} = require("../validations/schemas/supplement.schema.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");
const fs = require("fs").promises;
const path = require("path");

const EXPORTS_DIR = path.resolve(__dirname, "../../data/documents/exports");
const SUPPLEMENTS_ATTACHMENTS_DIR = path.resolve(
  __dirname,
  "../../data/documents/supplements"
);
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function supplementZodToPrisma(data) {
  const { documents, metadata, ...rest } = data;
  return rest;
}

function registerSupplementHandlers() {
  const eventManager = EventManager.getInstance();

  // Asegurar que existen los directorios necesarios
  fs.mkdir(EXPORTS_DIR, { recursive: true }).catch(console.error);
  fs.mkdir(SUPPLEMENTS_ATTACHMENTS_DIR, { recursive: true }).catch(
    console.error
  );

  const handlers = {
    [IPC_CHANNELS.DATA.SUPPLEMENTS.LIST]: async (event, contractId) => {
      if (!contractId) {
        throw AppError.validation(
          "ID de contrato requerido",
          "CONTRACT_ID_REQUIRED"
        );
      }

      const supplements = await prisma.supplement.findMany({
        where: { contractId },
        include: {
          documents: true,
          contract: {
            select: {
              number: true,
              title: true,
            },
          },
        },
      });

      return supplements;
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE]: async (
      event,
      { contractId, supplementData }
    ) => {
      if (!contractId || !supplementData) {
        throw AppError.validation(
          "Datos de suplemento incompletos",
          "INVALID_SUPPLEMENT_DATA",
          { required: ["contractId", "supplementData"] }
        );
      }

      try {
        const parsed = SupplementSchema.parse({
          ...supplementData,
          contractId,
        });

        const prismaData = supplementZodToPrisma(parsed);
        const supplement = await prisma.supplement.create({
          data: prismaData,
          include: {
            documents: true,
            contract: {
              select: {
                number: true,
                title: true,
              },
            },
          },
        });

        return supplement;
      } catch (error) {
        if (error.name === "ZodError") {
          throw AppError.validation(
            "Datos de suplemento inválidos",
            "INVALID_SUPPLEMENT_SCHEMA",
            { details: error.errors }
          );
        }
        throw AppError.internal(
          "Error al crear suplemento",
          "SUPPLEMENT_CREATE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.UPDATE]: async (event, { id, data }) => {
      if (!id) {
        throw AppError.validation(
          "ID de suplemento requerido",
          "SUPPLEMENT_ID_REQUIRED"
        );
      }

      try {
        const existingSupplement = await prisma.supplement.findUnique({
          where: { id },
        });

        if (!existingSupplement) {
          throw AppError.notFound(
            "Suplemento no encontrado",
            "SUPPLEMENT_NOT_FOUND"
          );
        }

        const parsed = SupplementSchema.parse({
          ...data,
          contractId: existingSupplement.contractId,
        });

        const prismaData = supplementZodToPrisma(parsed);
        const supplement = await prisma.supplement.update({
          where: { id },
          data: prismaData,
          include: {
            documents: true,
            contract: {
              select: {
                number: true,
                title: true,
              },
            },
          },
        });

        return supplement;
      } catch (error) {
        if (error instanceof AppError) throw error;
        if (error.name === "ZodError") {
          throw AppError.validation(
            "Datos de suplemento inválidos",
            "INVALID_SUPPLEMENT_SCHEMA",
            { details: error.errors }
          );
        }
        throw AppError.internal(
          "Error al actualizar suplemento",
          "SUPPLEMENT_UPDATE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.DELETE]: async (event, id) => {
      if (!id) {
        throw AppError.validation(
          "ID de suplemento requerido",
          "SUPPLEMENT_ID_REQUIRED"
        );
      }

      try {
        // Primero verificar si existe y obtener documentos relacionados
        const supplement = await prisma.supplement.findUnique({
          where: { id },
          include: { documents: true },
        });

        if (!supplement) {
          throw AppError.notFound(
            "Suplemento no encontrado",
            "SUPPLEMENT_NOT_FOUND"
          );
        }

        // Eliminar archivos físicos de los documentos
        const deletePromises = supplement.documents.map(async (doc) => {
          const filePath = path.join(SUPPLEMENTS_ATTACHMENTS_DIR, doc.filename);
          try {
            await fs.unlink(filePath);
          } catch (error) {
            console.error(`Error al eliminar archivo ${doc.filename}:`, error);
            // No lanzamos error aquí para permitir continuar con la eliminación del registro
          }
        });

        await Promise.all(deletePromises);

        // Eliminar el suplemento y sus documentos (en cascada)
        await prisma.supplement.delete({
          where: { id },
          include: { documents: true }, // Incluimos los documentos para logging
        });

        console.log(`Suplemento ${id} eliminado con éxito`);
        return true;
      } catch (error) {
        if (error instanceof AppError) throw error;

        console.error("Error al eliminar suplemento:", error);
        throw AppError.internal(
          "Error al eliminar suplemento",
          "SUPPLEMENT_DELETE_ERROR",
          {
            error: error.message,
            supplementId: id,
          }
        );
      }
    },
  };

  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerSupplementHandlers,
};

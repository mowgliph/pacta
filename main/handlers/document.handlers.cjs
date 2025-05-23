const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const {
  DocumentSchema,
} = require("../validations/schemas/document.schema.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const fs = require("fs").promises;
const path = require("path");
const { shell } = require("electron");
const { AppError } = require("../utils/error-handler.cjs");

const DOCUMENTS_DIR = path.resolve(__dirname, "../../data/documents");
const EXPORTS_DIR = path.resolve(__dirname, "../../data/documents/exports");
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function documentZodToPrisma(data) {
  const {
    name,
    type,
    description,
    tags = [],
    isPublic = false,
    uploadedById,
    contractId,
    supplementId,
    ...rest
  } = data;
  return {
    originalName: name,
    mimeType: type,
    description,
    tags: tags.length ? tags.join(",") : undefined,
    isPublic,
    uploadedById,
    contractId,
    supplementId,
    ...rest,
  };
}

function buildDocumentWhere(filters = {}) {
  const where = {};
  if (filters.contractId) where.contractId = filters.contractId;
  if (filters.supplementId) where.supplementId = filters.supplementId;
  if (filters.type) where.mimeType = filters.type;
  if (filters.name)
    where.originalName = { contains: filters.name, mode: "insensitive" };
  return where;
}

function registerDocumentHandlers() {
  const eventManager = EventManager.getInstance();

  // Asegurar que existen los directorios necesarios
  fs.mkdir(DOCUMENTS_DIR, { recursive: true }).catch(console.error);
  fs.mkdir(EXPORTS_DIR, { recursive: true }).catch(console.error);

  const handlers = {
    [IPC_CHANNELS.DATA.DOCUMENTS.LIST]: async (event, filters) => {
      try {
        if (filters && typeof filters !== 'object') {
          throw AppError.validation(
            "Filtros inválidos",
            "INVALID_FILTERS"
          );
        }

        const where = buildDocumentWhere(filters);
        const documents = await prisma.document.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: {
              select: { name: true, email: true },
            },
          },
        });

        return documents;
      } catch (error) {
        console.error("Error al listar documentos:", error);
        throw AppError.internal(
          "Error al listar documentos",
          "DOCUMENT_LIST_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.UPLOAD]: async (event, data) => {
      try {
        if (!data) {
          throw AppError.validation(
            "Datos de documento requeridos",
            "DOCUMENT_DATA_REQUIRED"
          );
        }

        const validatedData = DocumentSchema.parse(data);
        const prismaData = documentZodToPrisma(validatedData);

        // Validar tipo de archivo
        if (!ALLOWED_MIME_TYPES.includes(prismaData.mimeType)) {
          throw AppError.validation(
            "Tipo de archivo no permitido",
            "INVALID_FILE_TYPE",
            { allowedTypes: ALLOWED_MIME_TYPES }
          );
        }

        const document = await prisma.document.create({
          data: prismaData,
          include: {
            uploadedBy: {
              select: { name: true, email: true },
            },
          },
        });

        console.info("Documento subido exitosamente", { documentId: document.id });
        return document;
      } catch (error) {
        if (error.name === "ZodError") {
          throw AppError.validation(
            "Datos de documento inválidos",
            "INVALID_DOCUMENT_DATA",
            { details: error.errors }
          );
        }
        console.error("Error al subir documento:", error);
        throw AppError.internal(
          "Error al subir documento",
          "DOCUMENT_UPLOAD_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.DELETE]: async (event, id) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de documento requerido",
            "DOCUMENT_ID_REQUIRED"
          );
        }

        const document = await prisma.document.delete({
          where: { id },
        });

        // Eliminar archivo físico si existe
        try {
          await fs.unlink(path.join(DOCUMENTS_DIR, document.filename));
        } catch (error) {
          console.error("Error eliminando archivo:", error);
          // No lanzamos error aquí para permitir continuar con la eliminación del registro
        }

        console.info("Documento eliminado exitosamente", { documentId: id });
        return true;
      } catch (error) {
        console.error("Error al eliminar documento:", error);
        throw AppError.internal(
          "Error al eliminar documento",
          "DOCUMENT_DELETE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.DOWNLOAD]: async (event, id) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de documento requerido",
            "DOCUMENT_ID_REQUIRED"
          );
        }

        const document = await prisma.document.findUnique({
          where: { id },
        });

        if (!document) {
          throw AppError.notFound(
            "Documento no encontrado",
            "DOCUMENT_NOT_FOUND"
          );
        }

        const filePath = path.join(DOCUMENTS_DIR, document.filename);
        return { filePath, originalName: document.originalName };
      } catch (error) {
        console.error("Error al descargar documento:", error);
        throw AppError.internal(
          "Error al descargar documento",
          "DOCUMENT_DOWNLOAD_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_CONTRACT]: async (
      event,
      contractId
    ) => {
      return await prisma.document.findMany({
        where: { contractId },
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: {
            select: { name: true, email: true },
          },
        },
      });
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_SUPPLEMENT]: async (
      event,
      supplementId
    ) => {
      return await prisma.document.findMany({
        where: { supplementId },
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: {
            select: { name: true, email: true },
          },
        },
      });
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.OPEN]: async (event, id) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de documento requerido",
            "DOCUMENT_ID_REQUIRED"
          );
        }

        const document = await prisma.document.findUnique({
          where: { id },
        });

        if (!document) {
          throw AppError.notFound(
            "Documento no encontrado",
            "DOCUMENT_NOT_FOUND"
          );
        }

        const filePath = path.join(DOCUMENTS_DIR, document.filename);
        await shell.openPath(filePath);
        return true;
      } catch (error) {
        console.error("Error al abrir documento:", error);
        throw AppError.internal(
          "Error al abrir documento",
          "DOCUMENT_OPEN_ERROR",
          { error: error.message }
        );
      }
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerDocumentHandlers,
};

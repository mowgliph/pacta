import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { logger } from "../utils/logger";
import { DocumentSchema } from "../validations/schemas/document.schema";
import { prisma } from "../utils/prisma";
import fs from "fs";
import path from "path";
import { shell } from "electron";

const DOCUMENTS_DIR = path.resolve(__dirname, "../../data/documents");
const EXPORTS_DIR = path.resolve(__dirname, "../../data/documents/exports");
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function documentZodToPrisma(data: any) {
  // Solo mapear campos que existen en el modelo Prisma
  const {
    name,
    type,
    description,
    tags = [],
    isPublic = false,
    uploadedById,
    contractId,
    supplementId,
    // file y documentUrl no existen en Prisma
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

function buildDocumentWhere(filters: any = {}) {
  const where: any = {};
  if (filters.contractId) where.contractId = filters.contractId;
  if (filters.supplementId) where.supplementId = filters.supplementId;
  if (filters.type) where.mimeType = filters.type;
  if (filters.name)
    where.originalName = { contains: filters.name, mode: "insensitive" };
  if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
  return where;
}

export function registerDocumentHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.DOCUMENTS.LIST]: async (event, filters) => {
      logger.info("Listado de documentos solicitado", { filters });
      try {
        const where = buildDocumentWhere(filters);
        const documents = await prisma.document.findMany({ where });
        return documents;
      } catch (error) {
        logger.error("Error al listar documentos:", error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_CONTRACT]: async (
      event,
      contractId
    ) => {
      logger.info("Documentos por contrato solicitado", { contractId });
      try {
        const documents = await prisma.document.findMany({
          where: { contractId },
        });
        return documents;
      } catch (error) {
        logger.error("Error al obtener documentos por contrato:", error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_SUPPLEMENT]: async (
      event,
      supplementId
    ) => {
      logger.info("Documentos por suplemento solicitado", { supplementId });
      try {
        const documents = await prisma.document.findMany({
          where: { supplementId },
        });
        return documents;
      } catch (error) {
        logger.error("Error al obtener documentos por suplemento:", error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.UPLOAD]: async (event, meta, attachment) => {
      logger.info("Subida de documento solicitada", {
        meta,
        fileName: attachment?.name,
      });
      try {
        if (
          !attachment ||
          !attachment.name ||
          !attachment.data ||
          !attachment.type
        ) {
          throw new Error("Archivo adjunto inválido");
        }
        const ext = path.extname(attachment.name).toLowerCase();
        if (
          !ALLOWED_EXTENSIONS.includes(ext) ||
          !ALLOWED_MIME_TYPES.includes(attachment.type)
        ) {
          throw new Error("Tipo de archivo no permitido. Solo PDF o Word.");
        }
        fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
        const safeName = `${Date.now()}_${attachment.name}`;
        const filePath = path.join(DOCUMENTS_DIR, safeName);
        fs.writeFileSync(filePath, Buffer.from(attachment.data));
        // Registrar en base de datos
        const parsed = DocumentSchema.parse({
          ...meta,
          name: attachment.name,
          type: attachment.type,
        });
        const prismaData = documentZodToPrisma(parsed);
        const document = await prisma.document.create({
          data: {
            ...prismaData,
            filename: safeName,
            originalName: attachment.name,
            mimeType: attachment.type,
            size: attachment.data.length,
            path: safeName,
          },
        });
        logger.info("Documento guardado en:", filePath);
        return document;
      } catch (error) {
        logger.error("Error al subir documento:", error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.DOWNLOAD]: async (event, id) => {
      logger.info("Descarga de documento solicitada", { id });
      try {
        const doc = await prisma.document.findUnique({
          where: { id },
          select: { path: true },
        });
        if (!doc || !doc.path) throw new Error("Documento no encontrado");
        const absPath = path.resolve(DOCUMENTS_DIR, doc.path);
        if (!fs.existsSync(absPath))
          throw new Error("Archivo no encontrado en disco");
        await prisma.document.update({
          where: { id },
          data: { downloads: { increment: 1 } },
        });
        return { path: absPath };
      } catch (error) {
        logger.error("Error al descargar documento:", error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.OPEN]: async (event, id) => {
      logger.info("Apertura de documento solicitada", { id });
      try {
        const doc = await prisma.document.findUnique({
          where: { id },
          select: { path: true },
        });
        if (!doc || !doc.path) throw new Error("Documento no encontrado");
        const absPath = path.resolve(DOCUMENTS_DIR, doc.path);
        if (!fs.existsSync(absPath))
          throw new Error("Archivo no encontrado en disco");
        await shell.openPath(absPath);
        return true;
      } catch (error) {
        logger.error("Error al abrir documento:", error);
        throw error;
      }
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.DELETE]: async (event, id) => {
      logger.info("Eliminación de documento solicitada", { id });
      try {
        const doc = await prisma.document.findUnique({
          where: { id },
          select: { path: true },
        });
        if (doc && doc.path) {
          const absPath = path.resolve(DOCUMENTS_DIR, doc.path);
          if (fs.existsSync(absPath)) {
            fs.unlinkSync(absPath);
          }
        }
        await prisma.document.delete({ where: { id } });
        return true;
      } catch (error) {
        logger.error("Error al eliminar documento:", error);
        throw error;
      }
    },
  };

  eventManager.registerHandlers(handlers);
}

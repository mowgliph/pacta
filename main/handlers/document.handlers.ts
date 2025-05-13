import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { logger } from "../utils/logger";
import { DocumentSchema } from "../validations/schemas/document.schema";
import { prisma } from "../utils/prisma";
import fs from "fs";
import path from "path";
import { shell } from "electron";
import { withErrorHandling } from "../utils/error-handler";

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
    [IPC_CHANNELS.DATA.DOCUMENTS.LIST]: withErrorHandling(
      IPC_CHANNELS.DATA.DOCUMENTS.LIST,
      async (event: Electron.IpcMainInvokeEvent, filters: any) => {
        const where = buildDocumentWhere(filters);
        const documents = await prisma.document.findMany({ where });
        return { success: true, data: documents };
      }
    ),
    [IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_CONTRACT]: withErrorHandling(
      IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_CONTRACT,
      async (event: Electron.IpcMainInvokeEvent, contractId: string) => {
        const documents = await prisma.document.findMany({
          where: { contractId },
        });
        return { success: true, data: documents };
      }
    ),
    [IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_SUPPLEMENT]: withErrorHandling(
      IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_SUPPLEMENT,
      async (event: Electron.IpcMainInvokeEvent, supplementId: string) => {
        const documents = await prisma.document.findMany({
          where: { supplementId },
        });
        return { success: true, data: documents };
      }
    ),
    [IPC_CHANNELS.DATA.DOCUMENTS.UPLOAD]: withErrorHandling(
      IPC_CHANNELS.DATA.DOCUMENTS.UPLOAD,
      async (
        event: Electron.IpcMainInvokeEvent,
        meta: any,
        attachment: any
      ) => {
        logger.info("Subida de documento solicitada", {
          meta,
          fileName: attachment?.name,
        });
        if (
          !attachment ||
          !attachment.name ||
          !attachment.data ||
          !attachment.type
        ) {
          logger.error("Archivo adjunto inválido", { attachment });
          throw new Error("Archivo adjunto inválido");
        }
        // Validar nombre de archivo (sin rutas)
        const baseName = path.basename(attachment.name);
        const ext = path.extname(baseName).toLowerCase();
        if (
          !ALLOWED_EXTENSIONS.includes(ext) ||
          !ALLOWED_MIME_TYPES.includes(attachment.type)
        ) {
          logger.error("Tipo de archivo no permitido", {
            ext,
            mime: attachment.type,
          });
          throw new Error("Tipo de archivo no permitido. Solo PDF o Word.");
        }
        fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
        // Evitar sobrescritura accidental
        let safeName = `${Date.now()}_${baseName}`;
        let filePath = path.join(DOCUMENTS_DIR, safeName);
        let counter = 1;
        while (fs.existsSync(filePath)) {
          safeName = `${Date.now()}_${counter}_${baseName}`;
          filePath = path.join(DOCUMENTS_DIR, safeName);
          counter++;
        }
        fs.writeFileSync(filePath, Buffer.from(attachment.data));
        // Registrar en base de datos
        const parsed = DocumentSchema.parse({
          ...meta,
          name: baseName,
          type: attachment.type,
        });
        const prismaData = documentZodToPrisma(parsed);
        const document = await prisma.document.create({
          data: {
            ...prismaData,
            filename: safeName,
            originalName: baseName,
            mimeType: attachment.type,
            size: attachment.data.length,
            path: safeName,
          },
        });
        logger.info("Documento guardado en:", filePath);
        return { success: true, data: document };
      }
    ),
    [IPC_CHANNELS.DATA.DOCUMENTS.DOWNLOAD]: withErrorHandling(
      IPC_CHANNELS.DATA.DOCUMENTS.DOWNLOAD,
      async (event: Electron.IpcMainInvokeEvent, id: string) => {
        // Buscar documento en base de datos
        const doc = await prisma.document.findUnique({
          where: { id },
          select: { path: true, originalName: true },
        });
        if (!doc || !doc.path) {
          logger.error(`Documento no encontrado en base de datos: ${id}`);
          throw new Error("Documento no encontrado");
        }
        // Normalizar y validar ruta absoluta
        const absPath = path.resolve(DOCUMENTS_DIR, doc.path);
        if (!absPath.startsWith(DOCUMENTS_DIR)) {
          logger.error(
            `Intento de acceso a ruta fuera de documentos: ${absPath}`
          );
          throw new Error("Acceso no permitido");
        }
        if (!fs.existsSync(absPath)) {
          logger.error(`Archivo no encontrado en disco: ${absPath}`);
          throw new Error("Archivo no encontrado en disco");
        }
        // Incrementar contador de descargas
        await prisma.document.update({
          where: { id },
          data: { downloads: { increment: 1 } },
        });
        logger.info(`Documento descargado: ${doc.originalName} (${absPath})`);
        return {
          success: true,
          data: { path: absPath, name: doc.originalName },
        };
      }
    ),
    [IPC_CHANNELS.DATA.DOCUMENTS.OPEN]: withErrorHandling(
      IPC_CHANNELS.DATA.DOCUMENTS.OPEN,
      async (event: Electron.IpcMainInvokeEvent, id: string) => {
        const doc = await prisma.document.findUnique({
          where: { id },
          select: { path: true },
        });
        if (!doc || !doc.path) throw new Error("Documento no encontrado");
        const absPath = path.resolve(DOCUMENTS_DIR, doc.path);
        if (!fs.existsSync(absPath))
          throw new Error("Archivo no encontrado en disco");
        await shell.openPath(absPath);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.DATA.DOCUMENTS.DELETE]: withErrorHandling(
      IPC_CHANNELS.DATA.DOCUMENTS.DELETE,
      async (event: Electron.IpcMainInvokeEvent, id: string) => {
        const doc = await prisma.document.findUnique({
          where: { id },
          select: { path: true },
        });
        if (doc && doc.path) {
          const absPath = path.resolve(DOCUMENTS_DIR, doc.path);
          if (!absPath.startsWith(DOCUMENTS_DIR)) {
            logger.error(
              `Intento de eliminar archivo fuera de documentos: ${absPath}`
            );
            throw new Error("Acceso no permitido");
          }
          if (fs.existsSync(absPath)) {
            fs.unlinkSync(absPath);
            logger.info(`Archivo eliminado: ${absPath}`);
          } else {
            logger.warn(`Intento de eliminar archivo inexistente: ${absPath}`);
          }
        }
        await prisma.document.delete({ where: { id } });
        logger.info(`Registro de documento eliminado: ${id}`);
        return { success: true, data: true };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

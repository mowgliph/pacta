import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { SupplementSchema } from "../validations/schemas/supplement.schema";
import { prisma } from "../utils/prisma";
import fs from "fs";
import path from "path";
import { withErrorHandling } from "../utils/error-handler";

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

function supplementZodToPrisma(data: any) {
  // Eliminar campos que no existen en Prisma
  const { documents, metadata, ...rest } = data;
  return rest;
}

export function registerSupplementHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.SUPPLEMENTS.LIST]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.LIST,
      async (event: Electron.IpcMainInvokeEvent, contractId: string) => {
        const supplements = await prisma.supplement.findMany({
          where: { contractId },
        });
        return { success: true, data: supplements };
      }
    ),
    [IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE,
      async (
        event: Electron.IpcMainInvokeEvent,
        contractId: string,
        supplementData: any
      ) => {
        const parsed = SupplementSchema.parse({
          ...supplementData,
          contractId,
        });
        const prismaData = supplementZodToPrisma(parsed);
        const supplement = await prisma.supplement.create({ data: prismaData });
        return { success: true, data: supplement };
      }
    ),
    [IPC_CHANNELS.DATA.SUPPLEMENTS.UPDATE]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.UPDATE,
      async (
        event: Electron.IpcMainInvokeEvent,
        id: string,
        supplementData: any
      ) => {
        const parsed = SupplementSchema.partial().parse(supplementData);
        const prismaData = supplementZodToPrisma(parsed);
        delete prismaData.contractId;
        const supplement = await prisma.supplement.update({
          where: { id },
          data: prismaData,
        });
        return { success: true, data: supplement };
      }
    ),
    [IPC_CHANNELS.DATA.SUPPLEMENTS.DELETE]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.DELETE,
      async (event: Electron.IpcMainInvokeEvent, id: string) => {
        await prisma.supplement.delete({ where: { id } });
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.DATA.SUPPLEMENTS.UPLOAD]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.UPLOAD,
      async (
        event: Electron.IpcMainInvokeEvent,
        id: string,
        attachment: any
      ) => {
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
        fs.mkdirSync(SUPPLEMENTS_ATTACHMENTS_DIR, { recursive: true });
        const filePath = path.join(
          SUPPLEMENTS_ATTACHMENTS_DIR,
          `${id}_${Date.now()}_${attachment.name}`
        );
        fs.writeFileSync(filePath, Buffer.from(attachment.data));
        return { success: true, data: { path: filePath } };
      }
    ),
    [IPC_CHANNELS.DATA.SUPPLEMENTS.EXPORT]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.EXPORT,
      async (
        event: Electron.IpcMainInvokeEvent,
        id: string,
        { format = "pdf" } = {}
      ) => {
        fs.mkdirSync(EXPORTS_DIR, { recursive: true });
        let exportPath: string;
        if (format === "docx") {
          exportPath = path.join(
            EXPORTS_DIR,
            `suplemento_${id}_${Date.now()}.docx`
          );
          fs.writeFileSync(
            exportPath,
            Buffer.from("DOCX simulado del suplemento")
          );
        } else {
          exportPath = path.join(
            EXPORTS_DIR,
            `suplemento_${id}_${Date.now()}.pdf`
          );
          fs.writeFileSync(
            exportPath,
            Buffer.from("PDF simulado del suplemento")
          );
        }
        return { success: true, data: { path: exportPath } };
      }
    ),
  };

  eventManager.registerHandlers(handlers);
}

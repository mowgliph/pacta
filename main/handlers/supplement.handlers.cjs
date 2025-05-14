const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const {
  SupplementSchema,
} = require("../validations/schemas/supplement.schema.cjs");
const { prisma } = require("../utils/prisma.cjs");
const fs = require("fs");
const path = require("path");
const { withErrorHandling } = require("../utils/error-handler.cjs");

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

function registerSupplementHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.DATA.SUPPLEMENTS.LIST]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.LIST,
      async (event, contractId) => {
        const supplements = await prisma.supplement.findMany({
          where: { contractId },
        });
        return { success: true, data: supplements };
      }
    ),
    [IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE,
      async (event, contractId, supplementData) => {
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
      async (event, id, supplementData) => {
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
      async (event, id) => {
        await prisma.supplement.delete({ where: { id } });
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.DATA.SUPPLEMENTS.UPLOAD]: withErrorHandling(
      IPC_CHANNELS.DATA.SUPPLEMENTS.UPLOAD,
      async (event, id, attachment) => {
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
      async (event, id, { format = "pdf" } = {}) => {
        fs.mkdirSync(EXPORTS_DIR, { recursive: true });
        let exportPath;
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

module.exports = { registerSupplementHandlers, supplementZodToPrisma };

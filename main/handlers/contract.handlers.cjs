const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const fs = require("fs");
const path = require("path");
const { withErrorHandling } = require("../utils/error-handler.cjs");

const EXPORTS_DIR = path.resolve(__dirname, "../../data/documents/exports");
const CONTRACTS_ATTACHMENTS_DIR = path.resolve(
  __dirname,
  "../../data/documents/contracts"
);

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function contractZodToPrisma(data) {
  const {
    bankDetails = {},
    legalRepresentative = {},
    providerObligations = [],
    clientObligations = [],
    contactPhones = [],
    notificationMethods = [],
    attachments, // ignorado
    ...rest
  } = data;
  return {
    ...rest,
    bankAccount: bankDetails.account,
    bankBranch: bankDetails.branch,
    bankAgency: bankDetails.agency,
    bankHolder: bankDetails.holder,
    bankCurrency: bankDetails.currency,
    repName: legalRepresentative.name,
    repPosition: legalRepresentative.position,
    repDocumentType: legalRepresentative.documentType,
    repDocumentNumber: legalRepresentative.documentNumber,
    repDocumentDate: legalRepresentative.documentDate,
    providerObligations: JSON.stringify(providerObligations),
    clientObligations: JSON.stringify(clientObligations),
    contactPhones: JSON.stringify(contactPhones),
    notificationMethods: JSON.stringify(notificationMethods),
  };
}

function registerContractHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.DATA.CONTRACTS.LIST]: withErrorHandling(
      IPC_CHANNELS.DATA.CONTRACTS.LIST,
      async (event, filters) => {
        const contracts = await prisma.contract.findMany({ where: filters });
        return { success: true, data: contracts };
      }
    ),
    [IPC_CHANNELS.DATA.CONTRACTS.CREATE]: withErrorHandling(
      IPC_CHANNELS.DATA.CONTRACTS.CREATE,
      async (event, contractData) => {
        const contract = await prisma.contract.create({ data: contractData });
        return { success: true, data: contract };
      }
    ),
    [IPC_CHANNELS.DATA.CONTRACTS.UPDATE]: withErrorHandling(
      IPC_CHANNELS.DATA.CONTRACTS.UPDATE,
      async (event, contractId, contractData) => {
        const contract = await prisma.contract.update({
          where: { id: contractId },
          data: contractData,
        });
        return { success: true, data: contract };
      }
    ),
    [IPC_CHANNELS.DATA.CONTRACTS.ARCHIVE]: withErrorHandling(
      IPC_CHANNELS.DATA.CONTRACTS.ARCHIVE,
      async (event, contractId) => {
        const contract = await prisma.contract.update({
          where: { id: contractId },
          data: { status: "ARCHIVED" },
        });
        return { success: true, data: contract };
      }
    ),
    [IPC_CHANNELS.DATA.CONTRACTS.UPLOAD]: async (event, id, attachment) => {
      console.info("Subida de archivo de contrato solicitada", {
        id,
        attachment,
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
        fs.mkdirSync(CONTRACTS_ATTACHMENTS_DIR, { recursive: true });
        const filePath = path.join(
          CONTRACTS_ATTACHMENTS_DIR,
          `${id}_${Date.now()}_${attachment.name}`
        );
        fs.writeFileSync(filePath, Buffer.from(attachment.data));
        console.info("Archivo de contrato guardado en:", filePath);
        return { path: filePath };
      } catch (error) {
        console.error("Error al subir archivo de contrato:", error);
        throw error;
      }
    },
    [IPC_CHANNELS.DATA.CONTRACTS.EXPORT]: async (
      event,
      id,
      destPathOrOptions
    ) => {
      console.info("Exportación de contrato solicitada", {
        id,
        destPathOrOptions,
      });
      try {
        let destPath =
          typeof destPathOrOptions === "string" ? destPathOrOptions : undefined;
        let format =
          destPathOrOptions && destPathOrOptions.format
            ? destPathOrOptions.format
            : "pdf";
        const documents = await prisma.document.findMany({
          where: { contractId: id },
          orderBy: { uploadedAt: "asc" },
          take: 1,
        });
        if (documents.length > 0 && documents[0].path && destPath) {
          if (!fs.existsSync(documents[0].path)) {
            throw new Error("El archivo adjunto no existe en el sistema.");
          }
          fs.copyFileSync(documents[0].path, destPath);
          console.info("Adjunto exportado en:", destPath);
          return { path: destPath };
        }
        fs.mkdirSync(EXPORTS_DIR, { recursive: true });
        let exportPath;
        if (format === "docx") {
          exportPath =
            destPath ||
            path.join(EXPORTS_DIR, `contrato_${id}_${Date.now()}.docx`);
          fs.writeFileSync(
            exportPath,
            Buffer.from("DOCX simulado del contrato")
          );
        } else {
          exportPath =
            destPath ||
            path.join(EXPORTS_DIR, `contrato_${id}_${Date.now()}.pdf`);
          fs.writeFileSync(
            exportPath,
            Buffer.from("PDF simulado del contrato")
          );
        }
        console.info("Contrato exportado en:", exportPath);
        return { path: exportPath };
      } catch (error) {
        console.error("Error al exportar contrato:", error);
        throw error;
      }
    },
  };

  eventManager.registerHandlers(handlers);
}

module.exports = { registerContractHandlers, contractZodToPrisma };

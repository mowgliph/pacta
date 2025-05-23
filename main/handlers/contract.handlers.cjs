const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const fs = require("fs").promises;
const path = require("path");
const { AppError } = require("../utils/error-handler.cjs");

// Directorios y configuración
const EXPORTS_DIR = path.resolve(__dirname, "../../data/documents/exports");
const CONTRACTS_ATTACHMENTS_DIR = path.resolve(
  __dirname,
  "../../data/documents/contracts"
);

// Función auxiliar para convertir datos del esquema Zod a formato Prisma
function contractZodToPrisma(data) {
  const {
    bankDetails = {},
    legalRepresentative = {},
    providerObligations = [],
    clientObligations = [],
    contactPhones = [],
    notificationMethods = [],
    attachments,
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

function registerContractHandlers() {
  const eventManager = EventManager.getInstance();

  // Asegurar que existen los directorios necesarios
  fs.mkdir(EXPORTS_DIR, { recursive: true }).catch(console.error);
  fs.mkdir(CONTRACTS_ATTACHMENTS_DIR, { recursive: true }).catch(console.error);

  const handlers = {
    [IPC_CHANNELS.DATA.CONTRACTS.LIST]: async (event, filters = {}) => {
      try {
        if (filters && typeof filters !== 'object') {
          throw AppError.validation(
            "Filtros inválidos",
            "INVALID_FILTERS"
          );
        }

        const contracts = await prisma.contract.findMany({
          where: filters,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        });

        return contracts;
      } catch (error) {
        console.error("Error al listar contratos:", error);
        throw AppError.internal(
          "Error al listar contratos",
          "CONTRACT_LIST_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.CREATE]: async (event, data) => {
      try {
        if (!data) {
          throw AppError.validation(
            "Datos de contrato requeridos",
            "CONTRACT_DATA_REQUIRED"
          );
        }

        const prismaData = contractZodToPrisma(data);
        const contract = await prisma.contract.create({
          data: prismaData,
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        });

        console.info("Contrato creado exitosamente", { contractId: contract.id });
        return contract;
      } catch (error) {
        console.error("Error al crear contrato:", error);
        throw AppError.internal(
          "Error al crear contrato",
          "CONTRACT_CREATE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.UPDATE]: async (event, { id, data }) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de contrato requerido",
            "CONTRACT_ID_REQUIRED"
          );
        }
        if (!data) {
          throw AppError.validation(
            "Datos de contrato requeridos",
            "CONTRACT_DATA_REQUIRED"
          );
        }

        const prismaData = contractZodToPrisma(data);
        const contract = await prisma.contract.update({
          where: { id },
          data: prismaData,
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        });

        console.info("Contrato actualizado exitosamente", { contractId: id });
        return contract;
      } catch (error) {
        console.error("Error al actualizar contrato:", error);
        throw AppError.internal(
          "Error al actualizar contrato",
          "CONTRACT_UPDATE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.DELETE]: async (event, id) => {
      try {
        if (!id) {
          throw AppError.validation(
            "ID de contrato requerido",
            "CONTRACT_ID_REQUIRED"
          );
        }

        await prisma.contract.delete({
          where: { id },
        });
        console.info("Contrato eliminado exitosamente", { contractId: id });
        return true;
      } catch (error) {
        console.error("Error al eliminar contrato:", error);
        throw AppError.internal(
          "Error al eliminar contrato",
          "CONTRACT_DELETE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.DATA.CONTRACTS.GET_BY_ID]: async (event, id) => {
      const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          user: {
            select: { name: true, email: true },
          },
          supplements: true,
          documents: true,
        },
      });

      if (!contract) {
        throw new Error("Contrato no encontrado");
      }

      return contract;
    },

    [IPC_CHANNELS.DATA.CONTRACTS.ARCHIVE]: async (event, id) => {
      const contract = await prisma.contract.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      return contract;
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerContractHandlers,
};

const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { validateLicense } = require("./license-handler.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { AppError } = require("../utils/error-handler.cjs");

function registerLicenseHandlers() {
  const eventManager = EventManager.getInstance();

  const handlers = {
    [IPC_CHANNELS.LICENSE.VALIDATE]: async (event, licenseData) => {
      try {
        if (!licenseData) {
          throw AppError.validation(
            "Datos de licencia requeridos",
            "LICENSE_DATA_REQUIRED"
          );
        }

        const result = await validateLicense(licenseData);
        console.info("Licencia validada exitosamente", { licenseNumber: licenseData.licenseNumber });
        return result;
      } catch (error) {
        console.error("Error al validar licencia:", error);
        throw AppError.internal(
          "Error al validar licencia",
          "LICENSE_VALIDATE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.LICENSE.STATUS]: async () => {
      try {
        const license = await prisma.license.findFirst({
          where: { isActive: true },
          orderBy: { updatedAt: "desc" },
        });

        const status = license
          ? {
              valid: true,
              type: license.licenseType,
              expiryDate: license.expiryDate,
            }
          : { valid: false };

        console.info("Estado de licencia obtenido", { status });
        return status;
      } catch (error) {
        console.error("Error al obtener estado de licencia:", error);
        throw AppError.internal(
          "Error al obtener estado de licencia",
          "LICENSE_STATUS_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.LICENSE.REVOKE]: async (event, licenseNumber) => {
      try {
        if (!licenseNumber) {
          throw AppError.validation(
            "Número de licencia requerido",
            "LICENSE_NUMBER_REQUIRED"
          );
        }

        const license = await prisma.license.update({
          where: { licenseNumber },
          data: { isActive: false },
        });

        console.info("Licencia revocada exitosamente", { licenseNumber });
        return license;
      } catch (error) {
        console.error("Error al revocar licencia:", error);
        throw AppError.internal(
          "Error al revocar licencia",
          "LICENSE_REVOKE_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.LICENSE.LIST]: async () => {
      try {
        const licenses = await prisma.license.findMany({
          orderBy: { updatedAt: "desc" },
        });

        console.info("Lista de licencias obtenida", { count: licenses.length });
        return licenses;
      } catch (error) {
        console.error("Error al listar licencias:", error);
        throw AppError.internal(
          "Error al listar licencias",
          "LICENSE_LIST_ERROR",
          { error: error.message }
        );
      }
    },

    [IPC_CHANNELS.LICENSE.INFO]: async (event, licenseNumber) => {
      try {
        if (!licenseNumber) {
          throw AppError.validation(
            "Número de licencia requerido",
            "LICENSE_NUMBER_REQUIRED"
          );
        }

        const license = await prisma.license.findUnique({
          where: { licenseNumber },
        });

        if (!license) {
          throw AppError.notFound(
            "Licencia no encontrada",
            "LICENSE_NOT_FOUND"
          );
        }

        return license;
      } catch (error) {
        console.error("Error al obtener información de licencia:", error);
        throw AppError.internal(
          "Error al obtener información de licencia",
          "LICENSE_INFO_ERROR",
          { error: error.message }
        );
      }
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerLicenseHandlers,
};

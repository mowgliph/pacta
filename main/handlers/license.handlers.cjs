const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { validateLicense } = require("../utils/license.utils.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { AppError } = require("../utils/error-handler.cjs");

// Definición de los manejadores de licencia
const handlers = {
  [IPC_CHANNELS.LICENSE.VALIDATE]: async (event, licenseData) => {
    try {
      if (!licenseData) {
        throw AppError.validation(
          "Datos de licencia requeridos",
          "LICENSE_DATA_REQUIRED"
        );
      }

      const validationResult = await validateLicense(licenseData);
      
      await prisma.license.upsert({
        where: { key: licenseData.key },
        update: {
          status: validationResult.valid ? 'ACTIVE' : 'INVALID',
          validatedAt: new Date(),
          validationResult: validationResult
        },
        create: {
          key: licenseData.key,
          type: licenseData.type || 'STANDARD',
          status: validationResult.valid ? 'ACTIVE' : 'INVALID',
          validatedAt: new Date(),
          validationResult: validationResult
        }
      });

      return {
        valid: validationResult.valid,
        message: validationResult.message,
        expiresAt: validationResult.expiresAt,
        features: validationResult.features || {}
      };
    } catch (error) {
      console.error('Error al validar la licencia:', error);
      throw AppError.internal(
        'Error al validar la licencia',
        'LICENSE_VALIDATION_ERROR',
        { error: error.message }
      );
    }
  },
  
  [IPC_CHANNELS.LICENSE.STATUS]: async () => {
    try {
      const license = await prisma.license.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { validatedAt: 'desc' }
      });

      if (!license) {
        return { valid: false, message: 'No hay licencia activa' };
      }

      return {
        valid: true,
        key: license.key,
        type: license.type,
        status: license.status,
        validatedAt: license.validatedAt,
        expiresAt: license.validationResult?.expiresAt,
        features: license.validationResult?.features || {}
      };
    } catch (error) {
      console.error('Error al verificar el estado de la licencia:', error);
      return { valid: false, message: 'Error al verificar la licencia' };
    }
  },
  
  [IPC_CHANNELS.LICENSE.REVOKE]: async () => {
    try {
      await prisma.license.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'REVOKED', revokedAt: new Date() }
      });
      
      return { success: true, message: 'Licencia revocada exitosamente' };
    } catch (error) {
      console.error('Error al revocar la licencia:', error);
      throw AppError.internal(
        'Error al revocar la licencia',
        'LICENSE_REVOCATION_ERROR',
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
  }
};

/**
 * Registra los manejadores de licencia en el EventManager
 */
function registerLicenseHandlers() {
  const eventManager = EventManager.getInstance();
  
  // Verificar si ya hay manejadores registrados
  if (eventManager.handlers[IPC_CHANNELS.LICENSE.VALIDATE]) {
    console.log('[License Handlers] Los manejadores de licencia ya están registrados');
    return;
  }
  
  console.log('[License Handlers] Registrando manejadores de licencia');
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerLicenseHandlers
};
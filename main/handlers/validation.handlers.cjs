const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { ValidationService } = require("../validations/index.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");

const VALID_TYPES = [
  "contract",
  "user",
  "supplement",
  "document",
  "notification",
  "notificationFilter",
  "createBackup",
  "restoreBackup",
  "deleteBackup",
  "openFile",
  "confirmDialog",
  "performance",
];

function registerValidationHandlers() {
  const eventManager = EventManager.getInstance();
  const validationService = ValidationService.getInstance();

  const handlers = {
    [IPC_CHANNELS.VALIDATION.VALIDATE]: async (event, { type, data }) => {
      if (!type || !data) {
        throw AppError.validation(
          "Tipo y datos requeridos para validación",
          "TYPE_DATA_REQUIRED"
        );
      }

      if (!VALID_TYPES.includes(type)) {
        throw AppError.validation(
          `Tipo de validación no soportado: ${type}`,
          "INVALID_VALIDATION_TYPE",
          { validTypes: VALID_TYPES }
        );
      }

      try {
        let result;
        switch (type) {
          case "contract":
            result = validationService.validateContract(data);
            break;
          case "user":
            result = validationService.validateUser(data);
            break;
          case "supplement":
            result = validationService.validateSupplement(data);
            break;
          case "document":
            result = validationService.validateDocument(data);
            break;
          case "notification":
            result = validationService.validateNotification(data);
            break;
          case "notificationFilter":
            result = validationService.validateNotificationFilter(data);
            break;
          case "createBackup":
            result = validationService.validateCreateBackup(data);
            break;
          case "restoreBackup":
            result = validationService.validateRestoreBackup(data);
            break;
          case "deleteBackup":
            result = validationService.validateDeleteBackup(data);
            break;
          case "openFile":
            result = validationService.validateOpenFile(data);
            break;
          case "confirmDialog":
            result = validationService.validateConfirmDialog(data);
            break;
          case "performance":
            result = validationService.validatePerformance(data);
            break;
        }

        if (!result) {
          throw AppError.internal(
            "La validación no retornó ningún resultado",
            "VALIDATION_NO_RESULT",
            { type }
          );
        }

        return result;
      } catch (error) {
        if (error instanceof AppError) throw error;

        throw AppError.validation(error.message, "VALIDATION_ERROR", {
          type,
          originalError: error.message,
        });
      }
    },

    [IPC_CHANNELS.VALIDATION.SCHEMA.GET]: async (event, { type }) => {
      if (!type) {
        throw AppError.validation(
          "Tipo requerido para obtener schema",
          "TYPE_REQUIRED"
        );
      }

      try {
        const schema = await validationService.getSchema(type);
        if (!schema) {
          throw AppError.notFound(
            `Schema no encontrado para el tipo: ${type}`,
            "SCHEMA_NOT_FOUND"
          );
        }
        return schema;
      } catch (error) {
        if (error instanceof AppError) throw error;

        throw AppError.internal("Error al obtener schema", "SCHEMA_ERROR", {
          type,
          originalError: error.message,
        });
      }
    },

    [IPC_CHANNELS.VALIDATION.SCHEMA.LIST]: async () => {
      try {
        const schemas = await validationService.listSchemas();
        return schemas;
      } catch (error) {
        throw AppError.internal(
          "Error al listar schemas",
          "LIST_SCHEMAS_ERROR",
          { originalError: error.message }
        );
      }
    },
  };

  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerValidationHandlers,
};

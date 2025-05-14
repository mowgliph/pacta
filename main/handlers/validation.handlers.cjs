const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { ValidationService } = require("../validations/index.cjs");
const { withErrorHandling } = require("../utils/error-handler.cjs");

function registerValidationHandlers(eventManager) {
  const validationService = ValidationService.getInstance();

  const handlers = {
    [IPC_CHANNELS.VALIDATION.VALIDATE]: withErrorHandling(
      IPC_CHANNELS.VALIDATION.VALIDATE,
      async (event, { type, data }) => {
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
          default:
            throw new Error(`Tipo de validación no soportado: ${type}`);
        }
        return { success: true, data: result };
      }
    ),
    [IPC_CHANNELS.VALIDATION.SCHEMA.GET]: withErrorHandling(
      IPC_CHANNELS.VALIDATION.SCHEMA.GET,
      async (event, schemaName) => {
        return { success: true, data: null };
      }
    ),
    [IPC_CHANNELS.VALIDATION.SCHEMA.LIST]: withErrorHandling(
      IPC_CHANNELS.VALIDATION.SCHEMA.LIST,
      async () => {
        return { success: true, data: [] };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

module.exports = { registerValidationHandlers };

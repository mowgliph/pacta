import { ipcMain } from "electron";
import { ValidationService } from "../validations";
import { ValidationError } from "../utils/error-validation";

export const setupValidationChannel = () => {
  const validationService = ValidationService.getInstance();

  ipcMain.handle("validate:contract", async (_, data) => {
    try {
      validationService.validateContract(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:user", async (_, data) => {
    try {
      validationService.validateUser(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:supplement", async (_, data) => {
    try {
      validationService.validateSupplement(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:document", async (_, data) => {
    try {
      validationService.validateDocument(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:notification", async (_, data) => {
    try {
      validationService.validateNotification(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:notificationFilter", async (_, data) => {
    try {
      validationService.validateNotificationFilter(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:createBackup", async (_, data) => {
    try {
      validationService.validateCreateBackup(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:restoreBackup", async (_, data) => {
    try {
      validationService.validateRestoreBackup(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:deleteBackup", async (_, data) => {
    try {
      validationService.validateDeleteBackup(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:openFile", async (_, data) => {
    try {
      validationService.validateOpenFile(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });

  ipcMain.handle("validate:confirmDialog", async (_, data) => {
    try {
      validationService.validateConfirmDialog(data);
      return { success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          details: error.details,
        };
      }
      throw error;
    }
  });
};

const { ValidationError } = require("../utils/error-validation.cjs");
const { ContractSchema } = require("./schemas/contract.schema.cjs");
const { UserSchema } = require("./schemas/user.schema.cjs");
const { SupplementSchema } = require("./schemas/supplement.schema.cjs");
const { DocumentSchema } = require("./schemas/document.schema.cjs");
const { PerformanceSchema } = require("./schemas/performance.schema.cjs");
const {
  NotificationSchema,
  NotificationFilterSchema,
} = require("./schemas/notification.schema.cjs");
const {
  CreateBackupSchema,
  RestoreBackupSchema,
  DeleteBackupSchema,
} = require("./schemas/backup.schema.cjs");
const {
  OpenFileSchema,
  ConfirmDialogSchema,
} = require("./schemas/app.schema.cjs");

exports.ValidationService = class ValidationService {
  static instance = null;

  static getInstance() {
    if (!exports.ValidationService.instance) {
      exports.ValidationService.instance = new exports.ValidationService();
    }
    return exports.ValidationService.instance;
  }

  validateContract(data) {
    const result = ContractSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de contrato",
        result.error
      );
    }
  }

  validateUser(data) {
    const result = UserSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Error de validación de usuario", result.error);
    }
  }

  validateSupplement(data) {
    const result = SupplementSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de suplemento",
        result.error
      );
    }
  }

  validateDocument(data) {
    const result = DocumentSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de documento",
        result.error
      );
    }
  }

  validateNotification(data) {
    const result = NotificationSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de notificación",
        result.error
      );
    }
  }

  validateNotificationFilter(data) {
    const result = NotificationFilterSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de filtro de notificaciones",
        result.error
      );
    }
  }

  validateCreateBackup(data) {
    const result = CreateBackupSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de creación de backup",
        result.error
      );
    }
  }

  validateRestoreBackup(data) {
    const result = RestoreBackupSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de restauración de backup",
        result.error
      );
    }
  }

  validateDeleteBackup(data) {
    const result = DeleteBackupSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de eliminación de backup",
        result.error
      );
    }
  }

  validateOpenFile(data) {
    const result = OpenFileSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de opciones de archivo",
        result.error
      );
    }
  }

  validateConfirmDialog(data) {
    const result = ConfirmDialogSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de diálogo de confirmación",
        result.error
      );
    }
  }

  validatePerformance(data) {
    const result = PerformanceSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de métrica de rendimiento",
        result.error
      );
    }
  }
};

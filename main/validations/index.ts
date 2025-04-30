import { ValidationError } from "../utils/error-validation";
import { ContractSchema } from "./schemas/contract.schema";
import { UserSchema } from "./schemas/user.schema";
import { SupplementSchema } from "./schemas/supplement.schema";
import { DocumentSchema } from "./schemas/document.schema";
import { PerformanceSchema } from "./schemas/performance.schema";
import {
  NotificationSchema,
  NotificationFilterSchema,
} from "./schemas/notification.schema";
import {
  CreateBackupSchema,
  RestoreBackupSchema,
  DeleteBackupSchema,
} from "./schemas/backup.schema";
import { OpenFileSchema, ConfirmDialogSchema } from "./schemas/app.schema";

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  public validateContract(data: any): void {
    const result = ContractSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de contrato",
        result.error
      );
    }
  }

  public validateUser(data: any): void {
    const result = UserSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Error de validación de usuario", result.error);
    }
  }

  public validateSupplement(data: any): void {
    const result = SupplementSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de suplemento",
        result.error
      );
    }
  }

  public validateDocument(data: any): void {
    const result = DocumentSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de documento",
        result.error
      );
    }
  }

  public validateNotification(data: any): void {
    const result = NotificationSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de notificación",
        result.error
      );
    }
  }

  public validateNotificationFilter(data: any): void {
    const result = NotificationFilterSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de filtro de notificaciones",
        result.error
      );
    }
  }

  public validateCreateBackup(data: any): void {
    const result = CreateBackupSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de creación de backup",
        result.error
      );
    }
  }

  public validateRestoreBackup(data: any): void {
    const result = RestoreBackupSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de restauración de backup",
        result.error
      );
    }
  }

  public validateDeleteBackup(data: any): void {
    const result = DeleteBackupSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de eliminación de backup",
        result.error
      );
    }
  }

  public validateOpenFile(data: any): void {
    const result = OpenFileSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de opciones de archivo",
        result.error
      );
    }
  }

  public validateConfirmDialog(data: any): void {
    const result = ConfirmDialogSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de diálogo de confirmación",
        result.error
      );
    }
  }

  public validatePerformance(data: any): void {
    const result = PerformanceSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        "Error de validación de métrica de rendimiento",
        result.error
      );
    }
  }
}

import { ipcRenderer } from "electron";

export interface ValidationResult {
  success: boolean;
  error?: string;
  details?: any;
}

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  public async validateContract(data: any): Promise<ValidationResult> {
    try {
      return await ipcRenderer.invoke("validate:contract", data);
    } catch (error) {
      return {
        success: false,
        error: "Error al validar el contrato",
        details: error,
      };
    }
  }

  public async validateUser(data: any): Promise<ValidationResult> {
    try {
      return await ipcRenderer.invoke("validate:user", data);
    } catch (error) {
      return {
        success: false,
        error: "Error al validar el usuario",
        details: error,
      };
    }
  }

  public async validateSupplement(data: any): Promise<ValidationResult> {
    try {
      return await ipcRenderer.invoke("validate:supplement", data);
    } catch (error) {
      return {
        success: false,
        error: "Error al validar el suplemento",
        details: error,
      };
    }
  }
}

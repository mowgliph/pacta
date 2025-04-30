import { useState } from "react";
import {
  ValidationService,
  ValidationResult,
} from "../services/validation.service";

export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const validationService = ValidationService.getInstance();

  const validateContract = async (data: any): Promise<boolean> => {
    const result = await validationService.validateContract(data);
    if (!result.success) {
      setValidationErrors({
        ...validationErrors,
        contract: result.error || "Error de validación del contrato",
      });
      return false;
    }
    return true;
  };

  const validateUser = async (data: any): Promise<boolean> => {
    const result = await validationService.validateUser(data);
    if (!result.success) {
      setValidationErrors({
        ...validationErrors,
        user: result.error || "Error de validación del usuario",
      });
      return false;
    }
    return true;
  };

  const validateSupplement = async (data: any): Promise<boolean> => {
    const result = await validationService.validateSupplement(data);
    if (!result.success) {
      setValidationErrors({
        ...validationErrors,
        supplement: result.error || "Error de validación del suplemento",
      });
      return false;
    }
    return true;
  };

  const clearErrors = () => {
    setValidationErrors({});
  };

  return {
    validationErrors,
    validateContract,
    validateUser,
    validateSupplement,
    clearErrors,
  };
};

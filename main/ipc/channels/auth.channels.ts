/**
 * Canales IPC relacionados con autenticación
 */
import { AuthResult, ChangePasswordRequest, LoginCredentials, ResetPasswordRequest } from '../../shared/types';

/**
 * Enumera los canales IPC para autenticación
 */
export enum AuthChannels {
  LOGIN = "auth:login",
  LOGOUT = "auth:logout",
  VERIFY_TOKEN = "auth:verifyToken",
  RESET_PASSWORD = "auth:resetPassword",
  CHANGE_PASSWORD = "auth:changePassword",
}

/**
 * Interfaces para solicitudes relacionadas con autenticación
 */
export interface AuthRequests {
  [AuthChannels.LOGIN]: {
    request: LoginCredentials;
    response: AuthResult;
  };
  [AuthChannels.LOGOUT]: {
    request: void;
    response: { success: boolean };
  };
  [AuthChannels.VERIFY_TOKEN]: {
    request: { token: string };
    response: { valid: boolean; user?: any };
  };
  [AuthChannels.RESET_PASSWORD]: {
    request: ResetPasswordRequest;
    response: { success: boolean; message: string };
  };
  [AuthChannels.CHANGE_PASSWORD]: {
    request: ChangePasswordRequest;
    response: { success: boolean; message?: string };
  };
} 
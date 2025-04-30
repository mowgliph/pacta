/**
 * Canales IPC relacionados con autenticación
 */
import { ipcMain } from "electron";
import {
  AuthResult,
  ChangePasswordRequest,
  LoginCredentials,
  ResetPasswordRequest,
} from "../shared/types";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

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

/**
 * Registra los manejadores de canales IPC para autenticación
 */
export function registerAuthChannels() {
  ipcMain.handle(
    AuthChannels.LOGIN,
    async (_, credentials: LoginCredentials) => {
      return await AuthService.login(credentials);
    }
  );

  ipcMain.handle(AuthChannels.LOGOUT, async () => {
    return await AuthService.logout();
  });

  ipcMain.handle(AuthChannels.VERIFY_TOKEN, async (_, { token }) => {
    return await AuthService.verifyToken(token);
  });

  ipcMain.handle(
    AuthChannels.RESET_PASSWORD,
    async (_, request: ResetPasswordRequest) => {
      return await AuthService.resetPassword(request);
    }
  );

  ipcMain.handle(
    AuthChannels.CHANGE_PASSWORD,
    async (_, request: ChangePasswordRequest) => {
      return await AuthService.changePassword(
        request.id,
        request.currentPassword,
        request.newPassword
      );
    }
  );
}

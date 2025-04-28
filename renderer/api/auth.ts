import { z } from 'zod';

// Definir canales IPC para comunicación con el proceso principal
export const AuthChannels = {
  LOGIN: "auth:login",
  LOGOUT: "auth:logout",
  REFRESH_TOKEN: "auth:refreshToken",
  CHANGE_PASSWORD: "auth:changePassword",
  VERIFY_TOKEN: "auth:verifyToken",
};

// Esquemas para validación en el lado del cliente
export const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  rememberMe: z.boolean().optional().default(false),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Debe confirmar la nueva contraseña"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Servicios de API para autenticación
export const authApi = {
  /**
   * Autenticar usuario con credenciales
   */
  login: async (username, password, rememberMe = false) => {
    return window.Electron.ipcRenderer.invoke(AuthChannels.LOGIN, {
      username,
      password,
      rememberMe
    });
  },

  /**
   * Cerrar sesión de usuario
   */
  logout: async () => {
    return window.Electron.ipcRenderer.invoke(AuthChannels.LOGOUT);
  },

  /**
   * Renovar token de autenticación
   */
  refreshToken: async (token) => {
    return window.Electron.ipcRenderer.invoke(AuthChannels.REFRESH_TOKEN, { token });
  },

  /**
   * Cambiar contraseña de usuario
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const data = {
      userId,
      currentPassword,
      newPassword,
    };
    
    return window.Electron.ipcRenderer.invoke(AuthChannels.CHANGE_PASSWORD, data);
  },

  /**
   * Verificar validez de token
   */
  verifyToken: async (token) => {
    return window.Electron.ipcRenderer.invoke(AuthChannels.VERIFY_TOKEN, { token });
  }
}; 
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState } from "../types/auth";

/**
 * Store de autenticación usando Zustand
 * Gestiona el estado del usuario, token y proceso de autenticación
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      deviceId: null,
      lastTokenRefresh: null,

      // Login
      login: async (email: string, password: string, rememberMe = false, isSpecialUser = false) => {
        try {
          set({ isLoading: true, error: null });

          // Generar ID de dispositivo si no existe
          const deviceId = get().deviceId || generateDeviceId();

          // Invocar el método IPC para autenticar con identificación de dispositivo
          const response = await window.Electron.auth.login({
            usuario: email,
            password,
            rememberMe,
            deviceId,
            isSpecialUser
          });

          if (!response.token) {
            set({ error: 'No se recibió token de autenticación' });
            return false;
          }

          // Guardar datos de sesión
          set({ 
            token: response.token, 
            user: response.user,
            expiresAt: response.expiresAt,
            isAuthenticated: true,
            deviceId,
            error: null,
            lastTokenRefresh: new Date().toISOString()
          });

          return true;
        } catch (error: any) {
          const errorMessage = error.message || 'Error de autenticación';
          set({ error: errorMessage });
          
          // Ayuda para debug
          console.error('Error de autenticación:', error);
          
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout
      logout: () => {
        // Llamar al método IPC para cerrar sesión
        window.Electron.auth.logout().catch(console.error);
        
        // Limpiar estado
        set({ 
          token: null, 
          user: null,
          expiresAt: null,
          isAuthenticated: false,
          lastTokenRefresh: null
        });
      },

      // Refrescar token
      refreshToken: async (force = false) => {
        try {
          const { token, expiresAt, deviceId, lastTokenRefresh } = get();
          
          if (!token) return false;
          
          // Si no estamos cerca de la expiración y no es forzado, no es necesario refrescar
          if (!force && expiresAt) {
            const expiryTime = new Date(expiresAt).getTime();
            const now = Date.now();
            
            // Si faltan más tiempo del umbral para expirar, no renovar
            if (expiryTime - now > AUTH_CONFIG.REFRESH_THRESHOLD) {
              return true;
            }
            
            // Si se refrescó hace menos de 1 minuto, no renovar para evitar llamadas excesivas
            if (lastTokenRefresh) {
              const lastRefresh = new Date(lastTokenRefresh).getTime();
              if (now - lastRefresh < 60000) {
                return true;
              }
            }
          }
          
          // Intentar renovar el token con el ID del dispositivo
          const response = await window.Electron.ipcRenderer.invoke('auth:refresh', { deviceId });
          
          if (response.renewed && response.token) {
            set({ 
              token: response.token,
              expiresAt: response.expiresAt,
              user: response.user,
              lastTokenRefresh: new Date().toISOString()
            });
            return true;
          }
          
          // Si el token no es válido, cerrar sesión
          if (!response.valid) {
            get().logout();
            return false;
          }
          
          return true;
        } catch (error) {
          console.error('Error al refrescar token:', error);
          get().logout();
          return false;
        }
      },

      // Limpiar error
      clearError: () => set({ error: null })
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
        deviceId: state.deviceId
      }),
    }
  )
);

// Configuración de tiempos para la gestión de tokens (en milisegundos)
const AUTH_CONFIG = {
  // Verificar renovación cuando falten 10 minutos para expirar
  REFRESH_THRESHOLD: 10 * 60 * 1000,
  // Intervalo de verificación básica cada 5 minutos
  CHECK_INTERVAL: 5 * 60 * 1000,
  // Intervalo más frecuente cuando estamos cerca del umbral (1 minuto)
  ACTIVE_CHECK_INTERVAL: 60 * 1000
};

// Generar ID único para el dispositivo
const generateDeviceId = (): string => {
  return 'device_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         '_' + Date.now().toString(36);
}; 
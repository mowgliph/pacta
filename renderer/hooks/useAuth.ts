import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, CustomPermissions, AuthResult } from '../types/auth';

// Configuración de tiempos para la gestión de tokens (en milisegundos)
const AUTH_CONFIG = {
  // Verificar renovación cuando falten 10 minutos para expirar
  REFRESH_THRESHOLD: 10 * 60 * 1000,
  // Intervalo de verificación básica cada 5 minutos
  CHECK_INTERVAL: 5 * 60 * 1000,
  // Intervalo más frecuente cuando estamos cerca del umbral (1 minuto)
  ACTIVE_CHECK_INTERVAL: 60 * 1000
};

// Store de autenticación con Zustand y persistencia
const useAuthStore = create<AuthState>()(
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
            isSpecialUser // Pasar flag para usuarios especiales
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
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
        deviceId: state.deviceId
      }),
    }
  )
);

// Generar ID único para el dispositivo
const generateDeviceId = (): string => {
  return 'device_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         '_' + Date.now().toString(36);
};

// Calcular tiempo hasta expiración en milisegundos
const getTimeUntilExpiry = (expiresAt: string | null): number => {
  if (!expiresAt) return 0;
  
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, expiry - now);
};

// Hook para usar en componentes
export function useAuth() {
  const router = useRouter();
  const { 
    token, 
    user, 
    expiresAt,
    isAuthenticated, 
    isLoading, 
    error, 
    deviceId,
    login, 
    logout, 
    refreshToken,
    clearError
  } = useAuthStore();

  // Estado local para tracking tiempo hasta expiración
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(
    getTimeUntilExpiry(expiresAt)
  );

  // Verificar autenticación al montar componente
  useEffect(() => {
    const checkAuth = async () => {
      // Si tenemos token pero no usuario, verificar token
      if (token && !user) {
        const result = await window.Electron.ipcRenderer.invoke('auth:verify', { deviceId });
        
        if (!result.valid) {
          logout();
        }
      }
    };
    
    checkAuth();
  }, [token, user, deviceId, logout]);

  // Configurar sistema optimizado de refresco de token
  useEffect(() => {
    // Si no hay token o no está autenticado, no hacer nada
    if (!token || !isAuthenticated || !expiresAt) return;
    
    // Actualizar timeUntilExpiry inicialmente
    setTimeUntilExpiry(getTimeUntilExpiry(expiresAt));
    
    // Función para verificar y refrescar token
    const checkTokenExpiration = async () => {
      const timeLeft = getTimeUntilExpiry(expiresAt);
      setTimeUntilExpiry(timeLeft);
      
      // Si estamos por debajo del umbral de refresco, intentar renovar
      if (timeLeft <= AUTH_CONFIG.REFRESH_THRESHOLD) {
        await refreshToken();
      }
    };
    
    // Determinar intervalo de verificación según proximidad a expiración
    const interval = timeUntilExpiry <= AUTH_CONFIG.REFRESH_THRESHOLD * 2
      ? AUTH_CONFIG.ACTIVE_CHECK_INTERVAL  // Verificación frecuente si estamos cerca
      : AUTH_CONFIG.CHECK_INTERVAL;        // Verificación normal
    
    // Establecer intervalo de verificación
    const intervalId = setInterval(checkTokenExpiration, interval);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [token, isAuthenticated, expiresAt, refreshToken, timeUntilExpiry]);

  // Configurar listener para mensajes websocket de invalidación de sesión
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Establecer listener para eventos de invalidación de sesión
    const sessionInvalidatedHandler = () => {
      toast.error("Tu sesión ha sido cerrada desde otro dispositivo", {
        description: "Por seguridad, deberás iniciar sesión nuevamente."
      });
      logout();
      router.push('/auth');
    };
    
    // Registrar handler para eventos de invalidación
    window.Electron.receive("auth:sesion-invalidada", sessionInvalidatedHandler);
    
    // Limpiar listener al desmontar
    return () => {
      window.Electron.removeListener("auth:sesion-invalidada");
    };
  }, [isAuthenticated, logout, router]);

  // Función de logout con redirección
  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth');
    toast.success("Sesión cerrada correctamente");
  }, [logout, router]);

  // Función para verificar roles (memoizada)
  const hasRole = useCallback((roleName: string | string[]): boolean => {
    if (!user || !user.role) return false;

    if (Array.isArray(roleName)) {
      return roleName.includes(user.role.name);
    }

    return user.role.name === roleName;
  }, [user]);

  // Función para verificar permisos específicos (memoizada)
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    // Si no hay usuario, no hay permisos
    if (!user) return false;
    
    // Los Admin tienen todos los permisos
    if (user.role.name === 'Admin') return true;
    
    // Verificar permisos personalizados
    if (user.customPermissions) {
      const permissions = user.customPermissions[resource as keyof CustomPermissions];
      if (permissions && permissions[action as keyof typeof permissions] === true) {
        return true;
      }
    }
    
    // Verificar permisos del rol
    if (user.role.permissions) {
      return Boolean(
        user.role.permissions[resource] && 
        user.role.permissions[resource][action]
      );
    }
    
    return false;
  }, [user]);

  // Función para verificar múltiples permisos a la vez (memoizada)
  const hasMultiplePermissions = useCallback((
    requiredPermissions: Array<{ resource: string; action: string }>
  ): boolean => {
    // Si es administrador, tiene todos los permisos
    if (user?.role?.name === 'Admin') return true;
    
    // Verificar todos los permisos requeridos
    return requiredPermissions.every(({ resource, action }) => 
      hasPermission(resource, action)
    );
  }, [user, hasPermission]);

  // Formato de tiempo hasta expiración para UI
  const getExpirationTime = useMemo((): string => {
    if (timeUntilExpiry <= 0) return 'Expirado';
    
    const diffMins = Math.floor(timeUntilExpiry / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    
    if (diffHrs > 0) {
      return `${diffHrs} hora(s) y ${diffMins % 60} minuto(s)`;
    }
    
    return `${diffMins} minuto(s)`;
  }, [timeUntilExpiry]);

  // Calcular estado de expiración para UI
  const tokenStatus = useMemo(() => {
    if (!expiresAt) return 'no-token';
    if (timeUntilExpiry <= 0) return 'expired';
    if (timeUntilExpiry <= AUTH_CONFIG.REFRESH_THRESHOLD) return 'warning';
    return 'valid';
  }, [expiresAt, timeUntilExpiry]);

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    tokenStatus,
    expiryTime: getExpirationTime,
    login,
    logout: handleLogout,
    refreshToken,
    clearError,
    hasRole,
    hasPermission,
    hasMultiplePermissions
  };
}

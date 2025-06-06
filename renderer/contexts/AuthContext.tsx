import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';

// Tipo para la funcion de navegacion
type NavigateFunction = (to: string) => void;

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: UserWithRole;
  token: string;
  refreshToken: string;
}

type UserRole = 'admin' | 'ra';

interface AuthContextType {
  user: UserWithRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  refreshToken: () => Promise<boolean>;
  initializeNavigation: (navigate: NavigateFunction) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: UserWithRole | null;
    isLoading: boolean;
  }>({
    user: null,
    isLoading: true
  });
  
  const { user, isLoading } = authState;
  const [navigateFn, setNavigateFn] = useState<NavigateFunction | null>(null);
  
  // Función segura para actualizar el estado de autenticación
  const updateAuthState = useCallback((updates: Partial<typeof authState>) => {
    setAuthState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);
  


  // Funcion para inicializar la navegacion
  const initializeNavigation = useCallback((navigate: NavigateFunction) => {
    setNavigateFn(() => navigate);
  }, []);
  
  // Función para establecer el estado de carga
  const setLoading = useCallback((isLoading: boolean) => {
    updateAuthState({ isLoading });
  }, [updateAuthState]);

  // Funcion segura para navegar
  const safeNavigate = useCallback((to: string) => {
    if (navigateFn) {
      navigateFn(to);
    } else {
      console.warn('Navegación no disponible. Redirigiendo manualmente.');
      window.location.href = to;
    }
  }, [navigateFn]);

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        if (!token) {
          setLoading(false);
          return;
        }

        const verifyToken = async (token: string | null): Promise<boolean> => {
          try {
            if (!token) return false;
            const response = await window.electron.auth.verify(token);
            
            if (response?.success && response.data?.user) {
              // Usar el usuario de la respuesta de verificación
              const user = response.data.user as UserWithRole;
              
              // Verificar si el usuario tiene un rol
              if (!user.role) {
                console.error('El usuario no tiene un rol asignado');
                return false;
              }
              
              updateAuthState({ user });
              return true;
            }
            return false;
          } catch (error) {
            console.error('Error al verificar el token:', error);
            return false;
          }
        };

        // Primero intentar verificar el token
        const verified = await verifyToken(token);
        
        if (!verified && storedRefreshToken) {
          // Si la verificación falla, intentar refrescar el token
          const refreshed = await refreshToken();
          if (!refreshed) {
            // Si no se pudo refrescar, limpiar todo
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            updateAuthState({ user: null });
          }
        } else if (!verified) {
          // Si no hay refresh token, limpiar
          localStorage.removeItem('token');
          updateAuthState({ user: null });
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        updateAuthState({ user: null });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Verificar autenticación periódicamente
    const interval = setInterval(checkAuth, 5 * 60 * 1000); // Verificar cada 5 minutos
    
    return () => clearInterval(interval);
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await window.electron.auth.refresh(refreshToken);
      
      if (response?.success && response.data) {
        const { token, refreshToken: newRefreshToken, user } = response.data;
        
        // Verificar si el usuario tiene un rol
        const userWithRole = user as UserWithRole;
        if (!userWithRole.role) {
          console.error('El usuario no tiene un rol asignado');
          return false;
        }
        
        // Guardar tokens
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Usar el usuario de la respuesta de refresh
        updateAuthState({ user: userWithRole });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al refrescar el token:', error);
      return false;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await window.electron.auth.login(credentials);
      
      if (response.success && response.data) {
        const { token, refreshToken, user } = response.data;
        const userWithRole = user as UserWithRole;
        
        // Verificar si el usuario tiene un rol
        if (!userWithRole.role) {
          throw new Error('El usuario no tiene un rol asignado');
        }
        
        // Guardar token y refreshToken
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Actualizar el estado del usuario con los datos del login
        updateAuthState({ user: userWithRole });
          
        // Mostrar notificación de bienvenida
        toast.success(`¡Bienvenido ${userWithRole.name}!`, {
          description: 'Has iniciado sesión correctamente',
          position: 'top-right',
          duration: 4000,
        });
        
        // Redirigir al dashboard
        safeNavigate('/dashboard');
        return true;
      } else {
        throw new Error(response.error?.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      toast.error('Error al iniciar sesión', {
        description: error instanceof Error ? error.message : 'Credenciales inválidas. Por favor, inténtalo de nuevo.',
        position: 'top-right',
        duration: 4000,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await window.electron.auth.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      updateAuthState({ user: null, isLoading: false });
      
      // Redirigir al login
      safeNavigate('/login');
      
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente.',
        position: 'top-right',
        duration: 3000,
      });
    }
  };

  // Verificar si el usuario tiene alguno de los roles requeridos
  const hasRole = (roles: UserRole[]): boolean => {
    if (!user || !user.role) return false;
    return roles.some(role => user.role.name.toLowerCase() === role.toLowerCase());
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout, 
        hasRole,
        refreshToken,
        initializeNavigation // Exponer la función de inicialización
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

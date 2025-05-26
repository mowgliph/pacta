import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const verifyToken = async (token: string): Promise<boolean> => {
          try {
            const response = await window.electron.auth.verify(token);
            
            if (response?.success && response.data?.user) {
              // Usar el usuario de la respuesta de verificación
              const user = response.data.user as UserWithRole;
              
              // Verificar si el usuario tiene un rol
              if (!user.role) {
                console.error('El usuario no tiene un rol asignado');
                return false;
              }
              
              setUser(user);
              return true;
            }
            return false;
          } catch (error) {
            console.error('Error al verificar el token:', error);
            return false;
          }
        };

        const verified = await verifyToken(token);
        if (!verified) {
          // Intentar refrescar el token si la verificación falla
          const refreshed = await refreshToken();
          if (!refreshed) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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
        setUser(userWithRole);
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
      setIsLoading(true);
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
        setUser(userWithRole);
          
        // Mostrar notificación
        toast({
          title: '¡Bienvenido!',
          description: `Has iniciado sesión como ${userWithRole.name}`,
          variant: 'default',
        });
        
        // Redirigir al dashboard
        navigate('/admin/dashboard');
        return true;
      } else {
        throw new Error(response.error?.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Credenciales inválidas. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await window.electron.auth.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar estado local
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Redirigir a la página de dashboard
      navigate('/dashboard');
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
        variant: 'default',
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
        refreshToken
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

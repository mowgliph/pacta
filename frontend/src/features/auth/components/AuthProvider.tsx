import { type ReactNode, useEffect, createContext, useContext, useState } from "react";
import { useStore } from "@/store";
import { Login } from "@/pages/Login";
import { useNavigate, useMatches } from '@remix-run/react';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

type AuthProviderProps = {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const matches = useMatches();
  
  const { user, isAuthenticated, token, isLoading, logout: storeLogout } = useStore();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Verificar autenticación cuando se monta el componente
  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setInitialCheckDone(true);
    };
    
    init();
  }, []);
  
  // Verificar si la ruta actual requiere autenticación
  useEffect(() => {
    if (!initialCheckDone) return;
    
    const currentMatch = matches[matches.length - 1];
    
    // Verificar si la ruta requiere autenticación (handle.requiresAuth = true)
    if (currentMatch && currentMatch.handle && (currentMatch.handle as any).requiresAuth && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [matches, isAuthenticated, initialCheckDone, navigate]);

  // Función para verificar la autenticación
  const checkAuth = async (): Promise<boolean> => {
    if (isAuthenticated && token) {
      return true;
    }
    
    // Si hay token pero no está autenticado, el token podría haber expirado
    if (token && !isAuthenticated) {
      try {
        // Aquí podría intentar renovar el token o validarlo con el backend
        // Por ahora, simplemente consideramos que si hay token, está autenticado
        return true;
      } catch (error) {
        console.error('Error al verificar token:', error);
        await logout();
        return false;
      }
    }
    
    return false;
  };

  // Función para cerrar sesión
  const logout = async (): Promise<void> => {
    if (storeLogout) {
      await storeLogout();
      navigate('/login', { replace: true });
    }
  };

  // Show a loading state while we check authentication
  if (!initialCheckDone || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // If authenticated, render children
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      token, 
      checkAuth, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
} 
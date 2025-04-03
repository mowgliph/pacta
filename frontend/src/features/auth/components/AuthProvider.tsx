import { type ReactNode, useEffect, createContext, useState, useCallback } from "react";
import { useNavigate, useLocation, useMatches } from 'react-router-dom';
import { useStore, type User } from "@/store";
import { Spinner } from "@/components/ui/spinner";
import { type Role } from "@/types/enums";

type AuthContextType = {
  estaAutenticado: boolean;
  cargando: boolean;
  token: string | null;
  usuario: User | null;
  verificarAutenticacion: () => Promise<boolean>;
  cerrarSesion: () => Promise<void>;
  redirigirPorRol: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  
  const { 
    usuario,
    token, 
    estaAutenticado, 
    cargando, 
    cerrarSesion,
    verificarSesion,
    tienePermiso
  } = useStore();
  
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Función para redirigir al usuario según su rol
  const redirigirPorRol = useCallback(() => {
    if (!usuario) return;
    
    // Obtener la ruta a la que querían acceder
    const from = location.state?.from || '/dashboard';
    
    // Verificar si el usuario es administrador o desarrollador
    const esRolElevado = usuario.role === 'RA' || usuario.role === 'ADMIN';
    
    if (esRolElevado) {
      // Permitir acceso a la ruta solicitada para roles elevados
      navigate(from);
    } else {
      // Otros usuarios van al dashboard por defecto
      navigate('/dashboard');
    }
  }, [usuario, location.state, navigate]);

  // Función para verificar la autenticación
  const verificarAutenticacion = useCallback(async (): Promise<boolean> => {
    try {
      await verificarSesion();
      return estaAutenticado;
    } catch (error) {
      console.error("Error al verificar la autenticación:", error);
      return false;
    }
  }, [verificarSesion, estaAutenticado]);

  // Verificar autenticación cuando se monta el componente
  useEffect(() => {
    const init = async () => {
      await verificarAutenticacion();
      setInitialCheckDone(true);
    };
    
    init();
  }, [verificarAutenticacion]);
  
  // Verificar si la ruta actual requiere autenticación
  useEffect(() => {
    if (!initialCheckDone) return;
    
    const currentMatch = matches[matches.length - 1];
    if (!currentMatch || !currentMatch.handle) return;
    
    const handle = currentMatch.handle as { requiresAuth?: boolean, roles?: Role[] };
    
    // Si la ruta requiere autenticación y el usuario no está autenticado
    if (handle.requiresAuth && !estaAutenticado) {
      // Guardar la ubicación que intentaban acceder para redireccionar después del login
      navigate('/auth/login', { 
        replace: true, 
        state: { from: location.pathname } 
      });
      return;
    }
    
    // Si la ruta requiere roles específicos
    if (handle.requiresAuth && handle.roles && handle.roles.length > 0) {
      // Verificar si el usuario tiene alguno de los roles requeridos
      const hasRequiredRole = handle.roles.some(role => tienePermiso(role));
      
      if (!hasRequiredRole) {
        // Redireccionar a la página de acceso denegado
        navigate('/auth/access-denied', { replace: true });
      }
    }
  }, [matches, estaAutenticado, initialCheckDone, location.pathname, navigate, tienePermiso]);

  // Show a loading state while we check authentication
  if (!initialCheckDone || cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Return the provider with the authentication context
  return (
    <AuthContext.Provider value={{ 
      estaAutenticado, 
      cargando, 
      token,
      usuario,
      verificarAutenticacion, 
      cerrarSesion,
      redirigirPorRol
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext }; 
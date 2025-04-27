import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// Tipar el contenido del contexto con lo que proporciona useAuth
type AuthContextType = ReturnType<typeof useAuth>;

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de autenticación para la aplicación
 * 
 * Proporciona acceso centralizado a la funcionalidad de autenticación
 * a través de contexto de React a todos los componentes hijos
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Usar el hook de autenticación actual
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación
 * 
 * @returns El contexto de autenticación con todas sus propiedades y métodos
 * @throws Error si se utiliza fuera del AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}

/**
 * HOC (Higher Order Component) para proteger componentes que requieren autenticación
 * 
 * @param Component El componente a proteger
 * @param requiredRoles Roles requeridos para acceder al componente
 * @returns El componente envuelto con protección de autenticación
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: string[] = []
) {
  return function WithAuthComponent(props: P) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Importar ProtectedRoute para utilizarlo en el HOC withAuth
import { ProtectedRoute } from '../components/auth/protected-route'; 
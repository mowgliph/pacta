import { Navigate, useLocation, type To } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { type Role } from '@/types/enums';

type ProtectedRouteProps = {
  children: React.ReactNode;
  rolesPermitidos?: Role[];
  requiredRoles?: Role[];
  redirectTo?: To;
};

/**
 * Componente para proteger rutas basado en autenticación y roles
 * Redirecciona a login si el usuario no está autenticado
 * Redirecciona a la página de acceso denegado si no tiene los permisos necesarios
 */
export function ProtectedRoute({ 
  children, 
  rolesPermitidos = [], 
  requiredRoles = [],
  redirectTo = '/auth/access-denied' 
}: ProtectedRouteProps) {
  const { estaAutenticado, tienePermiso } = useAuth();
  const location = useLocation();
  
  // Combinar roles permitidos de ambos props para compatibilidad
  const roles = [...rolesPermitidos, ...requiredRoles];

  // Si el usuario no está autenticado, redirigir al login
  if (!estaAutenticado) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // Si no se especifican roles, permitir acceso a cualquier usuario autenticado
  if (roles.length === 0) {
    return <>{children}</>;
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const tieneAcceso = tienePermiso(roles);

  // Si el usuario no tiene los roles necesarios, redirigir a la ruta especificada
  if (!tieneAcceso) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si pasa todas las verificaciones, mostrar el contenido protegido
  return <>{children}</>;
} 
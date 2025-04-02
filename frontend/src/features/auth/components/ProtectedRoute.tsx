import React, { useEffect, type ReactNode } from 'react';
import { useStore } from '@/store';
import { Navigate, useLocation } from '@remix-run/react';
import { type Role } from '@/types/enums';
import { FullPageSpinner } from '@/components/ui/spinner'; // Asumiendo que tenemos un Spinner

type ProtectedRouteProps = {
  // Opcional: roles permitidos para esta ruta
  allowedRoles?: Role[];
  children?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, verifySession, isLoading, user, hasRole } = useStore(
    (state) => ({ 
      isAuthenticated: state.isAuthenticated, 
      verifySession: state.verifySession, 
      isLoading: state.isLoading,
      user: state.user, 
      hasRole: state.hasRole 
    })
  );
  const location = useLocation();
  const isLoadingSession = isLoading && !user; // Estamos cargando la sesión inicial

  useEffect(() => {
    // Si no estamos logueados y no estamos cargando, intentar verificar sesión
    if (!isAuthenticated && !isLoading) {
      verifySession();
    }
  }, [isAuthenticated, isLoading, verifySession]);

  // Mostrar spinner mientras se verifica la sesión por primera vez
  if (isLoadingSession) {
    return <FullPageSpinner />;
  }

  // Si después de verificar, no estamos logueados, redirigir a login
  if (!isAuthenticated) {
    // Guardar la ruta a la que se intentaba acceder para redirigir después del login
    const redirect = location.pathname;
    return <Navigate to="/login" state={{ from: redirect !== '/login' ? redirect : undefined }} />;
  }

  // Verificar roles si se especificaron
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !hasRole(allowedRoles)) {
      // Redirigir a una página de acceso denegado o al dashboard
      // Podríamos mostrar un mensaje o redirigir a /unauthorized
      return <Navigate to="/dashboard" />;
    }
  }

  // Si está logueado y tiene los roles (si aplica), renderizar los hijos o Outlet
  return <>{children}</>;
}; 
import React, { useEffect } from 'react';
import { useStore } from '@/store';
import { Navigate, Outlet, useRouterState } from '@tanstack/react-router';
import { Role } from '@/types/enums';
import { FullPageSpinner } from '@/components/ui/spinner'; // Asumiendo que tenemos un Spinner

interface ProtectedRouteProps {
  // Opcional: roles permitidos para esta ruta
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isLoggedIn, verifySession, loading, user, hasRole } = useStore(
    (state) => ({ 
      isLoggedIn: state.isLoggedIn, 
      verifySession: state.verifySession, 
      loading: state.loading,
      user: state.user, 
      hasRole: state.hasRole 
    })
  );
  const routerState = useRouterState();
  const isLoadingSession = loading && !user; // Estamos cargando la sesión inicial

  useEffect(() => {
    // Si no estamos logueados y no estamos cargando, intentar verificar sesión
    if (!isLoggedIn && !loading) {
      verifySession();
    }
  }, [isLoggedIn, loading, verifySession]);

  // Mostrar spinner mientras se verifica la sesión por primera vez
  if (isLoadingSession) {
    return <FullPageSpinner />;
  }

  // Si después de verificar, no estamos logueados, redirigir a login
  if (!isLoggedIn) {
    // Guardar la ruta a la que se intentaba acceder para redirigir después del login
    const redirect = routerState.location.pathname;
    return <Navigate to="/login" search={{ redirect: redirect !== '/login' ? redirect : undefined }} />;
  }

  // Verificar roles si se especificaron
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !hasRole(allowedRoles)) {
      // Redirigir a una página de acceso denegado o al dashboard
      // Podríamos mostrar un mensaje o redirigir a /unauthorized
      return <Navigate to="/dashboard" />;
    }
  }

  // Si está logueado y tiene los roles (si aplica), renderizar la ruta hija
  return <Outlet />;
}; 
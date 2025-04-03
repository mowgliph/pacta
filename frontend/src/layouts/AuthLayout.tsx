import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar un spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Redireccionar al dashboard si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center p-5">
        <div className="mb-6 flex flex-col items-center justify-center space-y-2 text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">PACTA</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Plataforma Avanzada de Contratos y Trámites Administrativos
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 
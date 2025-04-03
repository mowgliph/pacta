import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar un spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Redireccionar a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 
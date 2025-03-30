import React from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useStore(state => ({ 
    user: state.user, 
    logout: state.logout 
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {user && (
        <div className="mb-4">
          <p>Bienvenido, {user.firstName} {user.lastName}!</p>
          <p>Email: {user.email}</p>
          <p>Rol: {user.role}</p>
        </div>
      )}
      <Button onClick={logout} variant="destructive">
        Cerrar Sesión
      </Button>
      {/* Aquí iría el resto del contenido del Dashboard */}
    </div>
  );
}; 
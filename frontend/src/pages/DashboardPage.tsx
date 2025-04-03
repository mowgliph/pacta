import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido a tu panel de control</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Contratos</h2>
          <p className="text-muted-foreground mb-4">Gestiona tus contratos activos</p>
          <Link 
            to="/contracts" 
            className="text-primary hover:underline"
          >
            Ver contratos →
          </Link>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Estadísticas</h2>
          <p className="text-muted-foreground mb-4">Revisa tus datos y métricas</p>
          <Link 
            to="/statistics" 
            className="text-primary hover:underline"
          >
            Ver estadísticas →
          </Link>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
          <p className="text-muted-foreground mb-4">Administra los usuarios del sistema</p>
          <Link 
            to="/users" 
            className="text-primary hover:underline"
          >
            Ver usuarios →
          </Link>
        </div>
      </div>
      
      <div className="mt-8">
        <Link 
          to="/" 
          className="text-primary hover:underline"
        >
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage; 
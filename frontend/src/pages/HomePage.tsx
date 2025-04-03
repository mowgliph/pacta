import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a PACTA</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Plataforma Avanzada de Contratos y Trámites Administrativos
      </p>
      <div className="flex gap-4">
        <Link 
          to="/login" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Iniciar sesión
        </Link>
        <Link 
          to="/dashboard" 
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default HomePage; 
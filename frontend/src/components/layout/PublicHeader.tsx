import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

const PublicHeader: React.FC = () => {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">PACTA</span>
          </Link>
        </div>
        
        <nav className="hidden space-x-6 md:flex">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link to="/dashboard/public" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link to="/statistics/public" className="text-sm font-medium transition-colors hover:text-primary">
            Estadísticas
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/auth/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader; 
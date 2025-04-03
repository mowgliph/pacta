import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-background py-6">
      <div className="container px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">PACTA</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Sistema de gestión de contratos y acuerdos
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
            <div>
              <h3 className="text-sm font-medium">Navegación</h3>
              <nav className="mt-4 flex flex-col space-y-2">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Inicio
                </Link>
                <Link to="/dashboard/public" className="text-sm text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
                <Link to="/statistics/public" className="text-sm text-muted-foreground hover:text-foreground">
                  Estadísticas
                </Link>
              </nav>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Acceso</h3>
              <nav className="mt-4 flex flex-col space-y-2">
                <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Iniciar Sesión
                </Link>
                <Link to="/auth/register" className="text-sm text-muted-foreground hover:text-foreground">
                  Registrarse
                </Link>
              </nav>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} PACTA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter; 
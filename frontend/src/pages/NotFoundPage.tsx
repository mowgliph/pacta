import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <Link 
        to="/" 
        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
      >
        Volver a la página principal
      </Link>
    </div>
  );
};

export default NotFoundPage; 
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';

/**
 * Página 404 que se muestra cuando una ruta no existe
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-2">Página no encontrada</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Lo sentimos, la página que busca no existe o ha sido movida.
      </p>
      <Button asChild>
        <Link to="/" className="flex items-center gap-2">
          <IconArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>
    </div>
  );
};

export default NotFoundPage; 
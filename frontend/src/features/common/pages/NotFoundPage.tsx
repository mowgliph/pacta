import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * Página para mostrar cuando no se encuentra la ruta solicitada
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>
        
        <h2 className="mb-4 text-3xl font-bold">Página no encontrada</h2>
        
        <p className="mb-8 text-muted-foreground">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
          Es posible que la dirección URL esté mal escrita o que la página haya sido movida.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
          
          <Button variant="outline" className="gap-2" 
            onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
} 
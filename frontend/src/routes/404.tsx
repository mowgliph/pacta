import { Link } from '@remix-run/react';
import React from 'react';

/**
 * Página para rutas no encontradas (404)
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold mt-2">Página no encontrada</h2>
        <p className="mt-4 text-muted-foreground">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
} 
import { LoaderFunction, redirect } from '@remix-run/node';
import { useRouteError, Link } from '@remix-run/react';
import { useStore } from '../store';
import React from 'react';

/**
 * Ruta raíz que redirige según el estado de autenticación del usuario
 */
export const loader: LoaderFunction = async ({ request }) => {
  // Verificar si el usuario está autenticado
  // Nota: En el servidor no podemos acceder a useStore, así que habrá que
  // verificar el token de sesión desde la cookie
  
  // Para este ejemplo, redireccionamos siempre al login, pero en un entorno real
  // verificaríamos la cookie de sesión
  return redirect('/login');
};

// Componente que se mostrará si hay un error
export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Error</h1>
      <p className="text-muted-foreground">
        Ha ocurrido un error al cargar esta página.
      </p>
    </div>
  );
}

// Este componente nunca se renderiza debido a la redirección,
// pero Remix lo requiere
export default function Index() {
  return null;
} 
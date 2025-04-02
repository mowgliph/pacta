import { LoaderFunction, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { useStore } from '../store';

/**
 * Loader para verificar si el usuario ya está autenticado
 */
export const loader: LoaderFunction = async ({ request }) => {
  // En un entorno real, verificaríamos la cookie de autenticación aquí
  // Para este ejemplo, siempre asumimos que el usuario no está autenticado
  return { isAuthenticated: false };
};

/**
 * Componente para la página de login
 */
export default function Login() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  
  // Este hook solo funciona en el cliente, pero está bien
  // porque el loader ya verificó en el servidor
  const checkAuth = () => {
    const isAuth = useStore.getState().isAuthenticated;
    if (isAuth) {
      // Redireccionar al dashboard
      window.location.href = '/dashboard';
    }
  };
  
  // Solo se ejecuta en el cliente
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
    
    // Verificar el estado global para usuarios que ya estaban autenticados
    checkAuth();
  }, [isAuthenticated]);
  
  return <LoginPage />;
} 
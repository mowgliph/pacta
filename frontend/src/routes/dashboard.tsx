import { LoaderFunction, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import React from 'react';

/**
 * Loader para verificar autenticación antes de acceder al dashboard
 */
export const loader: LoaderFunction = async ({ request }) => {
  // En un entorno real, verificaríamos la cookie de autenticación aquí
  // y redireccionaríamos si el usuario no está autenticado
  
  const urlParams = new URL(request.url).searchParams;
  const mockAuth = urlParams.get('auth') === 'true';
  
  // Si no está autenticado, redireccionar al login
  if (!mockAuth) {
    // Para propósitos de demostración, puedes acceder usando ?auth=true
    // En producción, implementa un sistema real de autenticación
    // return redirect('/login');
  }
  
  return { isAuthenticated: true };
};

/**
 * Componente para la página del dashboard
 */
export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
} 
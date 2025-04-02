import { LoaderFunction, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { ContractsLayout as ContractsLayoutComponent } from '../../features/contracts/layouts/ContractsLayout';
import React from 'react';

/**
 * Loader para verificar autenticación antes de acceder a contratos
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
 * Componente para la sección de contratos
 * Sirve como layout para todas las rutas anidadas de contratos
 */
export default function ContractsLayout() {
  return (
    <ContractsLayoutComponent>
      <Outlet />
    </ContractsLayoutComponent>
  );
} 
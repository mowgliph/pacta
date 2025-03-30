// src/routes.tsx
import React from 'react';
import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage'; // Asumiendo que existirá en src/pages/
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useStore } from './store';

// --- Ruta Raíz (__root.tsx) ---
// Componente Raíz: Podría incluir layout general, Providers, etc.
const RootComponent = () => {
  // Llamar a verifySession al cargar la app
  const verifySession = useStore(state => state.verifySession);
  React.useEffect(() => {
    verifySession();
  }, [verifySession]);

  return (
    <>
      {/* Aquí podría ir un Header/Sidebar persistente */}
      <Outlet /> {/* Donde se renderizan las rutas hijas */}
      {/* <ReactQueryDevtools /> */}
      {/* <TanStackRouterDevtools /> */}
    </>
  );
};

const rootRoute = createRootRoute({
  component: RootComponent,
});

// --- Ruta Login (/login) ---
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// --- Ruta Padre Protegida (Layout para rutas autenticadas) ---
// Esta ruta actúa como un layout y aplica la protección.
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  // Un ID único para esta ruta padre
  id: '_protected',
  // Usar el componente ProtectedRoute aquí
  component: ProtectedRoute, 
});

// --- Ruta Dashboard (/dashboard) ---
const dashboardRoute = createRoute({
  // Esta ruta es hija de la ruta protegida
  getParentRoute: () => protectedRoute,
  path: '/', // Raíz relativa a la ruta protegida, efectivamente /dashboard
  component: DashboardPage,
});

// --- Crear el Árbol de Rutas ---
const routeTree = rootRoute.addChildren([
  loginRoute,
  // Anidar las rutas protegidas bajo el componente protector
  protectedRoute.addChildren([dashboardRoute])
]);

// --- Exportar la configuración para el Router ---
export const routerConfig = {
  routeTree,
}; 
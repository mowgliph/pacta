// src/routes.tsx
import React from 'react';
import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { NotificationContainer } from '../components/layout/NotificationContainer';
import { useStore } from '../store';

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
      {/* Contenedor de notificaciones globales */}
      <NotificationContainer />
      
      {/* Donde se renderizan las rutas hijas */}
      <Outlet />
      
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

// Añadir layout intermedio
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => protectedRoute,
  id: '_dashboard_layout',
  component: DashboardLayout,
});

// --- Ruta Dashboard (/dashboard) ---
const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/', 
  component: DashboardPage,
  beforeLoad: () => {
    return {
      breadcrumb: 'Dashboard'
    };
  }
});

// --- Crear el Árbol de Rutas ---
const routeTree = rootRoute.addChildren([
  loginRoute,
  // Anidar las rutas protegidas bajo el componente protector
  protectedRoute.addChildren([
    dashboardLayoutRoute.addChildren([
      dashboardRoute
    ])
  ])
]);

// --- Exportar la configuración para el Router ---
export const routerConfig = {
  routeTree,
};

// Exportar Route para que TanStack Router pueda generar correctamente el routeTree
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routes',
  component: () => <div>Routes Page</div>,
});
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import { Root } from './root';
import { Role } from '@/types/enums';

// Layouts
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const PublicLayout = lazy(() => import('../layouts/PublicLayout'));

// Auth Pages
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const AccessDeniedPage = lazy(() => import('../features/auth/pages/AccessDeniedPage'));

// Dashboard Pages
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const PublicDashboardPage = lazy(() => import('../features/dashboard/pages/PublicDashboardPage'));

// Contracts Pages
const ContractsListPage = lazy(() => import('../features/contracts/pages/ContractsListPage'));
const ContractDetailsPage = lazy(() => import('../features/contracts/pages/ContractDetailsPage'));
const ContractCreatePage = lazy(() => import('../features/contracts/pages/ContractCreatePage'));
const ContractEditPage = lazy(() => import('../features/contracts/pages/ContractEditPage'));
const SupplementListPage = lazy(() => import('../features/contracts/pages/SupplementListPage'));
const SupplementDetailsPage = lazy(() => import('../features/contracts/pages/SupplementDetailsPage'));
const SupplementCreatePage = lazy(() => import('../features/contracts/pages/SupplementCreatePage'));
const SupplementEditPage = lazy(() => import('../features/contracts/pages/SupplementEditPage'));

// Users Pages (solo para admin y RA)
const UsersListPage = lazy(() => import('../features/users/pages/UsersListPage'));
const UserProfilePage = lazy(() => import('../features/users/pages/UserProfilePage'));
const UserSettingsPage = lazy(() => import('../features/users/pages/UserSettingsPage'));

// Statistics Pages
const StatisticsPage = lazy(() => import('../features/statistics/pages/StatisticsPage'));
const PublicStatisticsPage = lazy(() => import('../features/statistics/pages/PublicStatisticsPage'));

// Common Pages
const HomePage = lazy(() => import('../features/common/pages/HomePage'));
const NotFoundPage = lazy(() => import('../components/shared/NotFoundPage'));
const ErrorPage = lazy(() => import('../features/common/pages/ErrorPage'));

// Rutas públicas (sin autenticación requerida)
export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'dashboard/public', element: <PublicDashboardPage /> },
      { path: 'statistics/public', element: <PublicStatisticsPage /> },
      { 
        path: 'contracts/public',
        children: [
          { index: true, element: <ContractsListPage isPublic={true} /> },
          { 
            path: ':id', 
            element: <ContractDetailsPage />,
            loader: ({ params }) => {
              return { id: params.id, isPublic: true };
            },
            handle: { loader: 'inline' }
          },
        ]
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'access-denied', element: <AccessDeniedPage /> },
    ],
  },
];

// Rutas privadas (protegidas, requieren autenticación)
export const privateRoutes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    handle: { requiresAuth: true },
    children: [
      { 
        index: true, 
        element: <DashboardPage />,
        handle: { requiresAuth: true }
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        handle: { requiresAuth: true }
      },
      {
        path: 'contracts',
        handle: { requiresAuth: true },
        children: [
          { 
            index: true, 
            element: <ContractsListPage />,
            handle: { requiresAuth: true }
          },
          { 
            path: 'new', 
            element: <ContractCreatePage />,
            handle: { requiresAuth: true }
          },
          { 
            path: ':id', 
            element: <ContractDetailsPage />,
            loader: ({ params }) => {
              return { id: params.id }; 
            },
            handle: { requiresAuth: true, loader: 'inline' }
          },
          { 
            path: ':id/edit', 
            element: <ContractEditPage />,
            loader: ({ params }) => {
              return { id: params.id };
            },
            handle: { requiresAuth: true, loader: 'inline' }
          },
          { 
            path: ':contractId/supplements',
            handle: { requiresAuth: true },
            children: [
              { 
                index: true, 
                element: <SupplementListPage />,
                loader: ({ params }) => {
                  return { contractId: params.contractId };
                },
                handle: { requiresAuth: true, loader: 'inline' }
              },
              { 
                path: 'new', 
                element: <SupplementCreatePage />,
                loader: ({ params }) => {
                  return { contractId: params.contractId };
                },
                handle: { requiresAuth: true, loader: 'inline' }
              },
              { 
                path: ':id', 
                element: <SupplementDetailsPage />,
                loader: ({ params }) => {
                  return { contractId: params.contractId, id: params.id };
                },
                handle: { requiresAuth: true, loader: 'inline' }
              },
              { 
                path: ':id/edit', 
                element: <SupplementEditPage />,
                loader: ({ params }) => {
                  return { contractId: params.contractId, id: params.id };
                },
                handle: { requiresAuth: true, loader: 'inline' }
              },
            ]
          },
        ],
      },
      {
        path: 'users',
        handle: { requiresAuth: true, roles: [Role.RA, Role.ADMIN] },
        children: [
          { 
            index: true, 
            element: <UsersListPage />,
            handle: { requiresAuth: true, roles: [Role.RA, Role.ADMIN] }
          },
          { 
            path: 'profile', 
            element: <UserProfilePage />,
            handle: { requiresAuth: true }
          },
          { 
            path: 'settings', 
            element: <UserSettingsPage />,
            handle: { requiresAuth: true }
          },
        ],
      },
      {
        path: 'statistics',
        element: <StatisticsPage />,
        handle: { requiresAuth: true }
      },
      { 
        path: '*', 
        element: <NotFoundPage /> 
      },
    ],
  },
];

// Todas las rutas combinadas
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...privateRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
]; 
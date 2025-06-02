import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/spinner';
import { RouterInitializer } from '@/components/RouterInitializer';

// Lazy loading para las paginas
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ContractsPage = lazy(() => import('@/pages/contracts/ContractsPage'));
const SuppliersPage = lazy(() => import('@/pages/suppliers/SuppliersPage'));
const ClientsPage = lazy(() => import('@/pages/clients/ClientsPage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'));
const SuplementosPage = lazy(() => import('@/pages/suplementos/SuplementosPage'));

// Páginas de contratos (comentadas hasta que se implementen)
// const NewContractPage = lazy(() => import('@/pages/contracts/NewContractPage'));
// const ContractDetailsPage = lazy(() => import('@/pages/contracts/ContractDetailsPage'));

// Componente de carga para el suspense
const Loader = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

// Componente de envoltura para manejar errores y carga
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<Loader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Navigate to="/dashboard" replace />
        <RouterInitializer />
      </>
    ),
  },
  {
    path: '/login',
    element: (
      <PageWrapper>
        <LoginPage />
      </PageWrapper>
    ),
  },
  {
    path: '/',
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <PageWrapper>
            <DashboardPage />
          </PageWrapper>
        )
      },
      {
        path: 'contracts',
        children: [
          {
            index: true,
            element: (
              <PageWrapper>
                <ContractsPage />
              </PageWrapper>
            ),
          },
          {
            path: ':id/suplementos',
            children: [
              {
                index: true,
                element: (
                  <PageWrapper>
                    <SuplementosPage />
                  </PageWrapper>
                ),
              },
              {
                path: 'nuevo',
                element: (
                  <PageWrapper>
                    <div>Nuevo Suplemento</div>
                  </PageWrapper>
                ),
              },
              {
                path: ':suplementoId',
                element: (
                  <PageWrapper>
                    <div>Detalle del Suplemento</div>
                  </PageWrapper>
                ),
              },
            ],
          },
        ],
      },
      {
        path: 'suppliers',
        element: (
          <PageWrapper>
            <SuppliersPage />
          </PageWrapper>
        ),
      },
      {
        path: 'clients',
        element: (
          <PageWrapper>
            <ClientsPage />
          </PageWrapper>
        ),
      },
      {
        path: 'users',
        element: (
          <PageWrapper>
            <UsersPage />
          </PageWrapper>
        ),
      },
      {
        path: 'reports',
        element: (
          <PageWrapper>
            <ReportsPage />
          </PageWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <PageWrapper>
            <SettingsPage />
          </PageWrapper>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <PageWrapper>
        <NotFoundPage />
      </PageWrapper>
    ),
  },
]);

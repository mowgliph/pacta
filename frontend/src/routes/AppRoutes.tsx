import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Role } from '@/types/enums';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { Spinner } from '@/components/ui/spinner';

// Importar páginas con carga perezosa
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const PublicDashboardPage = lazy(() => import('@/features/dashboard/pages/PublicDashboardPage'));
const ProfilePage = lazy(() => import('@/features/users/pages/UserProfilePage'));
const UserSettingsPage = lazy(() => import('@/features/users/pages/UserSettingsPage'));
const UsersListPage = lazy(() => import('@/features/users/pages/UsersListPage'));
const ContractsListPage = lazy(() => import('@/features/contracts/pages/ContractsListPage'));
const ContractDetailsPage = lazy(() => import('@/features/contracts/pages/ContractDetailsPage'));
const ContractCreatePage = lazy(() => import('@/features/contracts/pages/ContractCreatePage'));
const ContractEditPage = lazy(() => import('@/features/contracts/pages/ContractEditPage'));
const SupplementListPage = lazy(() => import('@/features/contracts/pages/SupplementListPage'));
const SupplementDetailsPage = lazy(() => import('@/features/contracts/pages/SupplementDetailsPage'));
const SupplementCreatePage = lazy(() => import('@/features/contracts/pages/SupplementCreatePage'));
const SupplementEditPage = lazy(() => import('@/features/contracts/pages/SupplementEditPage'));
const NotFoundPage = lazy(() => import('@/components/shared/NotFoundPage'));

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Rutas públicas con layout de autenticación */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
          </Route>
          
          {/* Rutas públicas con layout principal */}
          <Route element={<PublicLayout />}>
            <Route path="/public/dashboard" element={<PublicDashboardPage />} />
            <Route path="/public/contracts/:id" element={<PublicContractWrapper />} />
            <Route path="/public/contracts/:contractId/supplements/:id" element={<PublicSupplementWrapper />} />
          </Route>

          {/* Rutas protegidas con layout principal */}
          <Route element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route element={<MainLayout />}>
              {/* Dashboard - Acceso para todos los usuarios autenticados */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Perfil y Configuración - Acceso para todos los usuarios autenticados */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<UserSettingsPage />} />
              
              {/* Gestión de Usuarios - Acceso solo para Administradores */}
              <Route path="/users" element={
                <ProtectedRoute rolesPermitidos={[Role.ADMIN, Role.RA]}>
                  <UsersListPage />
                </ProtectedRoute>
              } />
              
              {/* Contratos - Vista de listado y detalles para todos los usuarios autenticados */}
              <Route path="/contracts" element={<ContractsListPage />} />
              <Route path="/contracts/:id" element={<ContractDetailsWrapper />} />
              
              {/* Gestión de Contratos - Acceso para crear/editar solo para roles con permisos */}
              <Route path="/contracts/new" element={
                <ProtectedRoute rolesPermitidos={[Role.ADMIN, Role.MANAGER]}>
                  <ContractCreatePage />
                </ProtectedRoute>
              } />
              <Route path="/contracts/:id/edit" element={
                <ProtectedRoute rolesPermitidos={[Role.ADMIN, Role.MANAGER]}>
                  <ContractEditWrapper />
                </ProtectedRoute>
              } />
              
              {/* Suplementos - Vista y gestión */}
              <Route path="/contracts/:contractId/supplements" element={<SupplementListWrapper />} />
              <Route path="/contracts/:contractId/supplements/:id" element={<SupplementDetailsWrapper />} />
              <Route path="/contracts/:contractId/supplements/new" element={
                <ProtectedRoute rolesPermitidos={[Role.ADMIN, Role.MANAGER]}>
                  <SupplementCreateWrapper />
                </ProtectedRoute>
              } />
              <Route path="/contracts/:contractId/supplements/:id/edit" element={
                <ProtectedRoute rolesPermitidos={[Role.ADMIN, Role.MANAGER]}>
                  <SupplementEditWrapper />
                </ProtectedRoute>
              } />
            </Route>
          </Route>
          
          {/* Redirección a la página pública del dashboard por defecto */}
          <Route path="/" element={<Navigate to="/public/dashboard" replace />} />
          
          {/* Página 404 para rutas no encontradas */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

// Componentes wrapper para pasar props desde los parámetros de ruta
const ContractDetailsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <ContractDetailsPage id={id!} />;
};

const ContractEditWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <ContractEditPage id={id!} />;
};

const SupplementListWrapper = () => {
  const { contractId } = useParams<{ contractId: string }>();
  return <SupplementListPage contractId={contractId!} />;
};

const SupplementDetailsWrapper = () => {
  const { contractId, id } = useParams<{ contractId: string; id: string }>();
  return <SupplementDetailsPage contractId={contractId!} id={id!} />;
};

const SupplementCreateWrapper = () => {
  const { contractId } = useParams<{ contractId: string }>();
  return <SupplementCreatePage contractId={contractId!} />;
};

const SupplementEditWrapper = () => {
  const { contractId, id } = useParams<{ contractId: string; id: string }>();
  return <SupplementEditPage contractId={contractId!} id={id!} />;
};

const PublicContractWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <ContractDetailsPage id={id!} isPublic={true} />;
};

const PublicSupplementWrapper = () => {
  const { contractId, id } = useParams<{ contractId: string; id: string }>();
  return <SupplementDetailsPage contractId={contractId!} id={id!} isPublic={true} />;
}; 
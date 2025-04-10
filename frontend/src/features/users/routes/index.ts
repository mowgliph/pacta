import { Route } from 'wouter';
import { UserManagementPage } from '../pages/UserManagementPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UserRole } from '../types';

export const userRoutes = (
  <>
    <Route 
      path="/users/new" 
      component={() => (
        <ProtectedRoute allowedRoles={[UserRole.RA, UserRole.ADMIN]}>
          <UserManagementPage />
        </ProtectedRoute>
      )} 
    />
    <Route 
      path="/users/:id/edit" 
      component={() => (
        <ProtectedRoute allowedRoles={[UserRole.RA, UserRole.ADMIN]}>
          <UserManagementPage />
        </ProtectedRoute>
      )} 
    />
  </>
);
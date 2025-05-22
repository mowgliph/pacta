'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ('admin' | 'ra')[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = ['admin', 'ra'], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirigir a la página de login si no está autenticado
        router.push(redirectTo);
      } else if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        // Redirigir a una página de no autorizado si no tiene los roles requeridos
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, hasRole, requiredRoles, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-azul-medio animate-spin mb-4" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRoles.length > 0 && !hasRole(requiredRoles))) {
    return null; // O un componente de carga mientras se redirige
  }

  return <>{children}</>;
}

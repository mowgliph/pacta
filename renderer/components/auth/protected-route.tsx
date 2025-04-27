import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from '../ui/spinner';
import { useRouteGuard } from '../../hooks/useRouteGuard';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * 
 * Verifica que el usuario esté autenticado y tenga los roles necesarios para acceder
 * Si no está autenticado, redirige a la página de login
 * Si no tiene los roles necesarios, redirige al dashboard
 * 
 * @param children - Contenido a mostrar si el usuario está autenticado y tiene los roles necesarios
 * @param requiredRoles - Array de roles permitidos para acceder a la ruta (opcional)
 * @param redirectTo - Ruta a la que redirigir si no se cumplen los requisitos (por defecto '/auth')
 */
export function ProtectedRoute({ 
  children, 
  requiredRoles = [],
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isLoading, isAccessAllowed, accessError } = useRouteGuard({
    requiredRoles,
    redirectTo
  });
  
  // Mostrar toast de error si hay un problema de acceso
  if (accessError && !isLoading) {
    toast.error(accessError, {
      id: `auth-error-${router.pathname}`,
      // Solo mostrar una vez por ruta
      onAutoClose: (t) => {
        // Evitar mostrar múltiples veces el mismo error
        sessionStorage.setItem(`toast-shown-${router.pathname}`, 'true');
      }
    });
  }
  
  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" className="text-primary-medium" />
        <span className="ml-2 text-primary-medium font-medium">Verificando autenticación...</span>
      </div>
    );
  }
  
  // Si no está permitido el acceso, no mostrar nada mientras se redirige
  if (!isAccessAllowed) {
    return null;
  }
  
  // Si pasó todas las verificaciones, mostrar el contenido
  return <>{children}</>;
} 
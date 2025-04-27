import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';

interface UseRouteGuardOptions {
  requiredRoles?: string[];
  redirectTo?: string;
  isPublic?: boolean;
}

/**
 * Hook personalizado para proteger rutas basado en autenticación y roles
 * 
 * @param options Opciones de configuración
 * @param options.requiredRoles Array de roles permitidos para acceder a la ruta
 * @param options.redirectTo Ruta a la que redirigir si no se cumplen los requisitos (por defecto '/auth')
 * @param options.isPublic Si la ruta es pública y no requiere autenticación
 * 
 * @returns Un objeto con estado de carga, acceso permitido y errores
 */
export function useRouteGuard({
  requiredRoles = [],
  redirectTo = '/auth',
  isPublic = false
}: UseRouteGuardOptions = {}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isAccessAllowed, setIsAccessAllowed] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    // Si está cargando, esperar
    if (isLoading) return;

    // Si es una ruta pública, permitir acceso siempre
    if (isPublic) {
      setIsAccessAllowed(true);
      return;
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push(redirectTo);
      setIsAccessAllowed(false);
      setAccessError('Autenticación requerida');
      return;
    }

    // Si no hay roles requeridos, permitir acceso
    if (requiredRoles.length === 0) {
      setIsAccessAllowed(true);
      return;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const userRole = user?.role?.name;
    if (!userRole || !requiredRoles.includes(userRole)) {
      // Si tiene rol pero no tiene los permisos necesarios, redirigir al dashboard
      router.push('/dashboard');
      setIsAccessAllowed(false);
      setAccessError('No tienes permisos suficientes para acceder a esta sección');
      return;
    }

    // Si pasa todas las verificaciones, permitir acceso
    setIsAccessAllowed(true);
    setAccessError(null);
  }, [isAuthenticated, isLoading, user, router, requiredRoles, redirectTo, isPublic]);

  return {
    isLoading,
    isAccessAllowed,
    accessError
  };
} 
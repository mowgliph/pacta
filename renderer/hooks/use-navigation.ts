import { useRouter } from "next/router";
import { useCallback } from "react";
import { ROUTES } from "../routes/routes";
import { useAuth } from "./useAuth";

type Role = "admin" | "ra";

export function useNavigation() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const navigate = useCallback(
    async (path: string) => {
      // Solo redirigir al login para rutas específicas que requieren autenticación
      const requiresAuth = [
        '/contracts/create',
        '/contracts/:id/supplements/create',
        '/settings'
      ].some(route => {
        const routePattern = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
        return routePattern.test(path);
      });

      if (!isAuthenticated && requiresAuth) {
        await router.replace(ROUTES.AUTH.LOGIN);
        return;
      }

      if (isAuthenticated && path.startsWith("/auth")) {
        await router.replace(ROUTES.DASHBOARD);
        return;
      }

      if (path.startsWith("/admin") && (!user || user.role.name !== "admin")) {
        await router.replace(ROUTES.DASHBOARD);
        return;
      }

      await router.push(path);
    },
    [router, isAuthenticated, user]
  );

  const canAccess = useCallback(
    (path: string, roles?: Role[]) => {
      // Solo verificar autenticación para rutas específicas
      const requiresAuth = [
        '/contracts/create',
        '/contracts/:id/supplements/create',
        '/settings'
      ].some(route => {
        const routePattern = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
        return routePattern.test(path);
      });

      if (!isAuthenticated && requiresAuth) {
        return false;
      }

      if (roles && roles.length > 0) {
        return user && roles.includes(user.role.name as Role);
      }

      return true;
    },
    [isAuthenticated, user]
  );

  return {
    navigate,
    canAccess,
    currentPath: router.pathname,
    isLoading: router.isFallback,
  };
}

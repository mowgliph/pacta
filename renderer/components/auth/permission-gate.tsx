"use client"

import type { ReactNode } from "react"
import { useAuthContext } from "../../context/auth-provider"  

interface PermissionGateProps {
  resource: "contracts" | "users" | "reports" | "settings"
  action: "create" | "read" | "update" | "delete" | "approve" | "assign" | "export" | "view" | "assign_roles"
  children: ReactNode
  fallback?: ReactNode
  showError?: boolean
}

/**
 * Componente que controla la visibilidad de elementos basados en permisos
 * 
 * @param resource - El recurso al que se quiere acceder (contracts, users, etc.)
 * @param action - La acción que se quiere realizar (create, read, etc.)
 * @param children - El contenido a mostrar si el usuario tiene permiso
 * @param fallback - El contenido alternativo a mostrar si no tiene permiso
 * @param showError - Si debe mostrar un mensaje de error en lugar del fallback
 */
export function PermissionGate({ 
  resource, 
  action, 
  children, 
  fallback = null,
  showError = false
}: PermissionGateProps) {
  const { hasRole, hasPermission, user } = useAuthContext()

  // Verificar si el usuario está autenticado
  if (!user) {
    return showError ? (
      <div className="text-sm text-red-500 p-2 rounded bg-red-50 border border-red-200">
        Usuario no autenticado
      </div>
    ) : fallback;
  }

  // Los administradores tienen todos los permisos
  if (hasRole('Admin')) {
    return <>{children}</>;
  }

  // Verificar si el usuario tiene el permiso requerido
  const allowed = hasRole(['Editor', 'Manager']) || hasPermission(resource, action);

  // Renderizar el contenido según los permisos
  if (allowed) {
    return <>{children}</>;
  } else if (showError) {
    return (
      <div className="text-sm text-red-500 p-2 rounded bg-red-50 border border-red-200">
        No tienes permiso para {action} {resource}
      </div>
    );
  } else {
    return <>{fallback}</>;
  }
}

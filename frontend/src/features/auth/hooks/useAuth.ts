import { useContext, useCallback } from "react";
import { AuthContext } from "../components/AuthProvider";
import { useStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { type Role } from "@/types/enums";

/**
 * Hook personalizado para acceder al contexto de autenticación
 * y las funciones del store relacionadas con la autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  
  const navigate = useNavigate();
  
  // Extraer funciones relacionadas con la autenticación del store
  const { 
    iniciarSesion, 
    cerrarSesion, 
    verificarSesion
  } = useStore();
  
  // Función para verificar permisos basados en roles
  const tienePermiso = useCallback((rolesRequeridos: Role | Role[]) => {
    // Si no hay usuario autenticado, no tiene permisos
    if (!context.usuario) return false;
    
    // Convertir a array si es un string
    const roles = Array.isArray(rolesRequeridos) ? rolesRequeridos : [rolesRequeridos];
    
    // Si no se requieren roles específicos, permitir
    if (roles.length === 0) return true;
    
    // Verificar si el usuario tiene alguno de los roles requeridos
    return roles.includes(context.usuario.role as Role);
  }, [context.usuario]);
  
  // Función para redirigir al usuario según su rol
  const redirigirPorRol = useCallback(() => {
    if (!context.usuario) return;
    
    switch (context.usuario.role) {
      case 'ADMIN':
        navigate('/dashboard');
        break;
      case 'RA':
        navigate('/dashboard');
        break;
      case 'USER':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard/public');
    }
  }, [context.usuario, navigate]);

  // Unir las funcionalidades del contexto y del store
  return {
    ...context,
    iniciarSesion,
    cerrarSesion,
    verificarSesion,
    tienePermiso,
    redirigirPorRol
  };
}; 
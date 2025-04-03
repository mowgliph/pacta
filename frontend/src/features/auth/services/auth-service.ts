import { api } from '@/lib/api';
import { type User } from '@/store';

// Tipos para las respuestas de la API
export type RespuestaLogin = {
  token: string;
  user: User;
}

export type RespuestaRegistro = {
  token: string;
  user: User;
}

export type RespuestaCerrarSesion = {
  success: boolean;
}

export type RespuestaRestablecerPassword = {
  success: boolean;
  message: string;
}

// Tipos para las solicitudes a la API
export type SolicitudLogin = {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export type SolicitudRegistro = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export type SolicitudRestablecerPassword = {
  username: string;
}

export type SolicitudCambiarPassword = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Servicio de autenticación para interactuar con la API
 */
export const ServicioAutenticacion = {
  /**
   * Inicia sesión con nombre de usuario y contraseña
   */
  iniciarSesion: async (datos: SolicitudLogin): Promise<RespuestaLogin> => {
    const respuesta = await api.post<RespuestaLogin, SolicitudLogin>('/auth/login', datos);
    
    // Guardar el token según la preferencia de recordarme
    if (datos.rememberMe) {
      localStorage.setItem('tokenAcceso', respuesta.token);
      localStorage.setItem('tokenRefresco', respuesta.token);
    } else {
      sessionStorage.setItem('tokenAcceso', respuesta.token);
      sessionStorage.setItem('tokenRefresco', respuesta.token);
    }
    
    return respuesta;
  },
  
  /**
   * Registra un nuevo usuario (solo accesible para RA y admin)
   */
  registrarUsuario: (datos: SolicitudRegistro) => 
    api.post<RespuestaRegistro, SolicitudRegistro>('/auth/register', datos),
  
  /**
   * Solicita restablecer la contraseña
   */
  solicitarRestablecerPassword: (datos: SolicitudRestablecerPassword) => 
    api.post<RespuestaRestablecerPassword, SolicitudRestablecerPassword>('/auth/forgot-password', datos),
    
  /**
   * Cambia la contraseña del usuario actual
   */
  cambiarPassword: (datos: SolicitudCambiarPassword) => 
    api.put<{ success: boolean }, SolicitudCambiarPassword>('/users/profile/password', datos),
    
  /**
   * Verifica si el token es válido
   */
  validarToken: async (token: string): Promise<boolean> => {
    try {
      await api.post<{ valid: boolean }, { token: string }>('/auth/verify-token', { token });
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Cierra la sesión del usuario actual
   */
  cerrarSesion: async (): Promise<RespuestaCerrarSesion> => {
    // Limpiar tokens almacenados
    localStorage.removeItem('tokenAcceso');
    localStorage.removeItem('tokenRefresco');
    sessionStorage.removeItem('tokenAcceso');
    sessionStorage.removeItem('tokenRefresco');
    
    try {
      // Informar al backend del cierre de sesión si hay token
      const tokenAcceso = localStorage.getItem('tokenAcceso') || sessionStorage.getItem('tokenAcceso');
      const tokenRefresco = localStorage.getItem('tokenRefresco') || sessionStorage.getItem('tokenRefresco');
      if (tokenAcceso || tokenRefresco) {
        return await api.post<RespuestaCerrarSesion, {}>('/auth/logout', {});
      }
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    }
    
    return { success: true };
  },
  
  /**
   * Obtiene la información del usuario actual
   */
  obtenerUsuarioActual: async (): Promise<User> => {
    return await api.get<User>('/auth/me');
  },

  /**
   * Verifica si el usuario está autenticado
   */
  estaAutenticado: (): boolean => {
    return !!(localStorage.getItem('tokenAcceso') || sessionStorage.getItem('tokenAcceso'));
  },

  /**
   * Obtiene el token actual almacenado en localStorage o sessionStorage
   */
  obtenerToken: (): string | null => {
    return localStorage.getItem('tokenAcceso') || sessionStorage.getItem('tokenAcceso');
  }
}; 
import { api } from '@/lib/api';
import { User } from '@/store';

// Tipos para las respuestas de la API
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Tipos para las solicitudes
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Servicio de autenticación para interactuar con la API
 */
export const AuthService = {
  /**
   * Inicia sesión con email y contraseña
   */
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/auth/login', data),
  
  /**
   * Registra un nuevo usuario
   */
  register: (data: RegisterRequest) => 
    api.post<RegisterResponse>('/auth/register', data),
  
  /**
   * Solicita restablecer la contraseña
   */
  requestPasswordReset: (data: ResetPasswordRequest) => 
    api.post<ResetPasswordResponse>('/auth/forgot-password', data),
    
  /**
   * Cambia la contraseña del usuario actual
   */
  changePassword: (data: ChangePasswordRequest) => 
    api.post<{ success: boolean }>('/auth/change-password', data),
    
  /**
   * Verifica si el token es válido
   */
  validateToken: (token: string) => 
    api.get<{ valid: boolean }>('/auth/verify-token', { token }),
    
  /**
   * Cierra la sesión del usuario actual
   */
  logout: () => 
    api.post<{ success: boolean }>('/auth/logout'),
    
  /**
   * Obtiene la información del usuario actual
   */
  getCurrentUser: () => 
    api.get<User>('/auth/me'),
}; 
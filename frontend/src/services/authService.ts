import { apiClient } from '@/lib/api/client';
import { Role, UserStatus } from '@/types/enums';

// Tipos de datos esperados de la API (ajustar si es necesario)
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isSystemUser: boolean;
  status?: UserStatus;
  profileImage?: string;
  lastLogin?: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface VerifyTokenResponse {
  user: User;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Realiza la solicitud de inicio de sesión al backend.
 * @param email - Email del usuario.
 * @param password - Contraseña del usuario.
 * @returns Promise<LoginResponse>
 */
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  // Nota: Asegúrate de que la URL '/login' sea correcta
  const response = await apiClient.post<LoginResponse>('/login', { email, password });
  return response.data;
};

/**
 * Realiza la solicitud para verificar un token de acceso.
 * @param token - El token de acceso a verificar.
 * @returns Promise<VerifyTokenResponse>
 */
export const verifyUserToken = async (token: string): Promise<VerifyTokenResponse> => {
  // Nota: Asegúrate de que la URL '/verify-token' sea correcta
  const response = await apiClient.post<VerifyTokenResponse>('/verify-token', { token });
  return response.data;
};

/**
 * Realiza la solicitud para refrescar los tokens de autenticación.
 * @param refreshToken - El token de refresco actual.
 * @returns Promise<RefreshTokenResponse>
 */
export const refreshUserToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  // Nota: Asegúrate de que la URL '/refresh-token' sea correcta
  const response = await apiClient.post<RefreshTokenResponse>('/refresh-token', { refreshToken });
  return response.data;
}; 
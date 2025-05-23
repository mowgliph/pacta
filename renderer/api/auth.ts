import { ApiResponse, User } from './common';

// Tipos de credenciales
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Tipos de respuesta
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthApi {
  login: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponse>>;
  logout: () => Promise<ApiResponse<boolean>>;
  verify: (token: string) => Promise<ApiResponse<{ user: User }>>;
  refresh: (refreshToken: string) => Promise<ApiResponse<AuthResponse>>;
  changePassword: (data: ChangePasswordData) => Promise<ApiResponse<boolean>>;
  getProfile: () => Promise<ApiResponse<User>>;
}

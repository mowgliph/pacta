/**
 * Definición de tipos para la autenticación y autorización
 */

// Tipo para un permiso individual
export interface Permission {
  create?: boolean | null;
  read?: boolean | null;
  update?: boolean | null;
  delete?: boolean | null;
  approve?: boolean | null;
  assign?: boolean | null;
  export?: boolean | null;
  view?: boolean | null;
  assign_roles?: boolean | null;
}

// Tipo para los permisos personalizados de un usuario
export interface CustomPermissions {
  contracts?: Permission;
  users?: Permission;
  reports?: Permission;
  settings?: Permission;
  [key: string]: Permission | undefined;
}

// Tipo para el rol de usuario
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, Record<string, boolean>>;
}

// Tipo para un usuario
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  lastLogin?: string;
  customPermissions?: CustomPermissions;
  createdAt?: string;
}

// Tipo para el resultado de login
export interface AuthResult {
  token: string;
  user: User;
  expiresAt: string;
  deviceId?: string;
}

// Tipo para los datos de login
export interface LoginCredentials {
  usuario: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
  isSpecialUser?: boolean;
}

// Estado de token para UI
export type TokenStatus = "valid" | "warning" | "expired" | "no-token";

// Tipo para el estado de autenticación
export interface AuthState {
  token: string | null;
  user: User | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  deviceId: string | null;
  lastTokenRefresh: string | null;

  // Métodos
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
    isSpecialUser?: boolean
  ) => Promise<boolean>;
  logout: () => void;
  refreshToken: (force?: boolean) => Promise<boolean>;
  clearError: () => void;
}

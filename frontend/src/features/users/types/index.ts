/**
 * Tipos para el módulo de usuarios
 */

import { User } from '@/store';
import { UserStatus } from '@/types/enums';

/**
 * Tipo extendido para usuarios con metadata adicional
 */
export interface UserDetails extends User {
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status: UserStatus;
  permissions?: string[];
}

/**
 * Parámetros para la búsqueda de usuarios
 */
export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de usuarios
 */
export interface UsersResponse {
  data: UserDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Datos para crear un usuario
 */
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: UserStatus;
  permissions?: string[];
}

/**
 * Datos para actualizar un usuario
 */
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: UserStatus;
  permissions?: string[];
}

/**
 * Tipo para cambiar contraseña de usuario
 */
export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Datos para mostrar en el perfil de usuario
 */
export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  phone?: string;
  department?: string;
}

/**
 * Permisos disponibles en el sistema
 */
export enum UserPermission {
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_CONTRACTS = 'view_contracts',
  EDIT_CONTRACTS = 'edit_contracts',
  DELETE_CONTRACTS = 'delete_contracts',
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  ADMIN = 'admin'
}

/**
 * Roles disponibles en el sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
} 
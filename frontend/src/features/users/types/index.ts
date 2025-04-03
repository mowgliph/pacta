/**
 * Tipos para el módulo de usuarios
 */

import { type User } from '@/store';
import { type UserStatus } from '@/types/enums';

/**
 * Tipo extendido para usuarios con metadata adicional
 */
export type UserDetails = {
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status: UserStatus;
  permissions?: string[];
  address?: string;
  phone?: string;
  position?: string;
  department?: {
    id: string;
    name: string;
  };
} & User

/**
 * Parámetros para la búsqueda de usuarios
 */
export type UserSearchParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  departmentId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de usuarios
 */
export type UsersResponse = {
  items: User[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Datos para crear un usuario
 */
export type CreateUserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: UserStatus;
  departmentId?: string;
  address?: string;
  phone?: string;
  position?: string;
  permissions?: string[];
}

/**
 * Datos para actualizar un usuario
 */
export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: UserStatus;
  departmentId?: string;
  address?: string;
  phone?: string;
  position?: string;
  permissions?: string[];
}

/**
 * Tipo para cambiar contraseña de usuario
 */
export type ChangePasswordData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Datos para mostrar en el perfil de usuario
 */
export type UserProfileData = {
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
  ADMIN = 'ADMIN',
  RA = 'RA',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

// Enums
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export type ResetPasswordData = {
  token: string;
  newPassword: string;
  confirmPassword: string;
} 
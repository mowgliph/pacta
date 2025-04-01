import { api } from '@/lib/api';
import { User } from '@/store';

// Tipo extendido para usuarios con metadata adicional
export interface UserDetails extends User {
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions?: string[];
}

// Parámetros para la búsqueda de usuarios
export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Respuesta paginada de usuarios
export interface UsersResponse {
  data: UserDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Datos para crear un usuario
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: 'active' | 'inactive';
  permissions?: string[];
}

// Datos para actualizar un usuario
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  permissions?: string[];
}

/**
 * Servicio para gestionar usuarios
 */
export const UsersService = {
  /**
   * Obtiene todos los usuarios con paginación y filtros
   */
  getUsers: (params: UserSearchParams = {}) => 
    api.get<UsersResponse>('/users', { params }),
  
  /**
   * Obtiene un usuario por su ID
   */
  getUser: (id: string) => 
    api.get<UserDetails>(`/users/${id}`),
  
  /**
   * Crea un nuevo usuario
   */
  createUser: (data: CreateUserData) => 
    api.post<UserDetails>('/users', data),
  
  /**
   * Actualiza un usuario existente
   */
  updateUser: (id: string, data: UpdateUserData) => 
    api.put<UserDetails>(`/users/${id}`, data),
  
  /**
   * Elimina un usuario
   */
  deleteUser: (id: string) => 
    api.delete(`/users/${id}`),
  
  /**
   * Actualiza el avatar de un usuario
   */
  updateAvatar: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.post<{ avatarUrl: string }>(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  /**
   * Reinicia la contraseña de un usuario
   */
  resetUserPassword: (id: string) => 
    api.post<{ success: boolean, message: string }>(`/users/${id}/reset-password`),
    
  /**
   * Actualiza los permisos de un usuario
   */
  updateUserPermissions: (id: string, permissions: string[]) => 
    api.put<{ success: boolean }>(`/users/${id}/permissions`, { permissions }),
}; 
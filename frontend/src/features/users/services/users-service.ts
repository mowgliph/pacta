import { api } from '@/lib/api';
import { 
  UserDetails, 
  UserSearchParams, 
  UsersResponse, 
  CreateUserData, 
  UpdateUserData 
} from '../types';

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

  /**
   * Obtiene usuarios activos (para selectores, etc.)
   */
  getActiveUsers: () => 
    api.get<UserDetails[]>('/users/active'),

  /**
   * Obtiene usuarios por rol
   */
  getUsersByRole: (role: string) => 
    api.get<UserDetails[]>(`/users/by-role/${role}`),
}; 
import { useGet, usePost, usePut, useDelete } from '@/lib/api/swr-hooks';
import { 
  UserDetails, 
  UserSearchParams, 
  UsersResponse, 
  CreateUserData, 
  UpdateUserData,
  ChangePasswordData
} from '../types';

/**
 * Hook para obtener una lista paginada de usuarios
 * @param params Parámetros de búsqueda y paginación
 */
export function useUsersList(params: UserSearchParams = {}) {
  // Convertir parámetros a querystring para la clave de caché
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);
  if (params.status) queryParams.append('status', String(params.status));
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  const url = `/users${queryString ? `?${queryString}` : ''}`;
  
  return useGet<UsersResponse>(url, {
    revalidateOnFocus: false,
    dedupingInterval: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener un usuario por ID
 * @param id ID del usuario
 */
export function useUser(id: string | null) {
  return useGet<UserDetails>(id ? `/users/${id}` : null, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para crear un nuevo usuario
 */
export function useCreateUser() {
  return usePost<CreateUserData, UserDetails>('/users');
}

/**
 * Hook para actualizar un usuario existente
 */
export function useUpdateUser(id: string) {
  return usePut<UpdateUserData, UserDetails>(`/users/${id}`);
}

/**
 * Hook para eliminar un usuario
 */
export function useDeleteUser() {
  return useDelete<{ success: boolean }>('/users');
}

/**
 * Hook para actualizar el avatar de un usuario
 */
export function useUpdateAvatar(id: string) {
  return usePost<FormData, { avatarUrl: string }>(`/users/${id}/avatar`);
}

/**
 * Hook para reiniciar la contraseña de un usuario
 */
export function useResetUserPassword(id: string) {
  return usePost<{}, { success: boolean, message: string }>(`/users/${id}/reset-password`);
}

/**
 * Hook para actualizar permisos de un usuario
 */
export function useUpdateUserPermissions(id: string) {
  return usePut<{ permissions: string[] }, { success: boolean }>(`/users/${id}/permissions`);
}

/**
 * Hook para cambiar la contraseña del usuario
 */
export function useChangePassword() {
  return usePost<ChangePasswordData, { success: boolean }>('/users/change-password');
}

/**
 * Hook para obtener una lista de usuarios activos (para selectores, etc.)
 */
export function useActiveUsers() {
  return useGet<UserDetails[]>('/users/active', {
    revalidateOnFocus: false,
    dedupingInterval: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para obtener usuarios por rol
 */
export function useUsersByRole(role: string | null) {
  return useGet<UserDetails[]>(role ? `/users/by-role/${role}` : null, {
    revalidateOnFocus: false,
    dedupingInterval: 15 * 60 * 1000, // 15 minutos
  });
} 
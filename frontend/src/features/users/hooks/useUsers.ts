import { type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/hooks/useApi';
import { CACHE_TIMES } from '@/lib/react-query';
import { 
  type User, 
  type UserDetails, 
  type UsersResponse, 
  type CreateUserData, 
  type UpdateUserData,
  type UserSearchParams,
} from '../types';

// Claves para consultas
const USERS_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_KEYS.all, 'list'] as const,
  list: (params: UserSearchParams) => [...USERS_KEYS.lists(), params] as const,
  details: () => [...USERS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
  profile: () => [...USERS_KEYS.all, 'profile'] as const,
};

/**
 * Hook para obtener una lista paginada de usuarios
 */
export function useUsersList(
  params: UserSearchParams,
  options?: UseQueryOptions<UsersResponse>
) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);
  if (params.status) queryParams.append('status', params.status);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const queryString = queryParams.toString();
  const url = `/users${queryString ? `?${queryString}` : ''}`;
  
  return useApiGet<UsersResponse>(
    url,
    USERS_KEYS.list(params),
    {
      staleTime: CACHE_TIMES.MEDIUM,
      ...options,
    }
  );
}

/**
 * Hook para obtener los detalles de un usuario
 */
export function useUser(
  id: string,
  options?: UseQueryOptions<UserDetails>
) {
  return useApiGet<UserDetails>(
    `/users/${id}`,
    USERS_KEYS.detail(id),
    {
      staleTime: CACHE_TIMES.MEDIUM,
      ...options,
    }
  );
}

/**
 * Hook para obtener el perfil del usuario actual
 */
export function useUserProfile(
  options?: UseQueryOptions<UserDetails>
) {
  return useApiGet<UserDetails>(
    '/users/profile',
    USERS_KEYS.profile(),
    {
      staleTime: CACHE_TIMES.SHORT,
      ...options,
    }
  );
}

/**
 * Hook para crear un nuevo usuario
 */
export function useCreateUser() {
  return useApiPost<User, CreateUserData>('/users');
}

/**
 * Hook para actualizar un usuario existente
 */
export function useUpdateUser(id: string) {
  return useApiPut<User, UpdateUserData>(`/users/${id}`);
}

/**
 * Hook para eliminar un usuario
 */
export function useDeleteUser() {
  return useApiDelete<User>('/users');
}

/**
 * Hook para obtener los usuarios activos
 */
export function useActiveUsers(
  options?: UseQueryOptions<User[]>
) {
  return useApiGet<User[]>(
    '/users?status=active',
    [...USERS_KEYS.lists(), { status: 'active' }] as QueryKey,
    {
      staleTime: CACHE_TIMES.LONG,
      ...options,
    }
  );
}

/**
 * Hook para obtener usuarios por rol
 */
export function useUsersByRole(
  role: string,
  options?: UseQueryOptions<User[]>
) {
  return useApiGet<User[]>(
    `/users?role=${role}`,
    [...USERS_KEYS.lists(), { role }] as QueryKey,
    {
      staleTime: CACHE_TIMES.LONG,
      ...options,
    }
  );
} 
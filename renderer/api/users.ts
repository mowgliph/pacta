import { ApiResponse, UserFilters, PaginationResponse, User } from './common';
import { Role } from './roles';
import { ChangePasswordData } from './auth';

// Tipos de datos
export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  isActive: boolean;
}

export interface UserUpdateData extends Partial<UserCreateData> {
  id: string;
  currentPassword?: string;
}

// Tipos de API
export interface UsersApi {
  list: (filters?: UserFilters) => Promise<ApiResponse<PaginationResponse<User>>>;
  create: (userData: UserCreateData) => Promise<ApiResponse<User>>;
  update: (userData: UserUpdateData) => Promise<ApiResponse<User>>;
  delete: (userId: string) => Promise<ApiResponse<boolean>>;
  toggleActive: (userId: string) => Promise<ApiResponse<boolean>>;
  changePassword: (userId: string, data: ChangePasswordData) => Promise<ApiResponse<boolean>>;
  getUserProfile: () => Promise<ApiResponse<User>>;
  getById: (userId: string) => Promise<ApiResponse<User>>;
}

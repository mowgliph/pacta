import { ApiResponse, PaginationResponse } from './common';

export interface Role {
  id: string;
  name: string;
}

export interface RoleCreateData {
  name: string;
}

export interface RoleUpdateData extends Partial<RoleCreateData> {
  id: string;
}

export interface RolesApi {
  list: (filters?: any) => Promise<ApiResponse<PaginationResponse<Role>>>;
  create: (data: RoleCreateData) => Promise<ApiResponse<Role>>;
  update: (data: RoleUpdateData) => Promise<ApiResponse<Role>>;
  delete: (id: string) => Promise<ApiResponse<boolean>>;
}

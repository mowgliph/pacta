// Tipos básicos
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Tipos de paginación
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Tipos de filtros
export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Tipos de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de error
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Tipos de fecha
export interface DateRange {
  startDate: string;
  endDate: string;
}

export enum UserRole {
  ADMIN = "admin",
  RA = "ra",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export enum UserChannels {
  GET_ALL = "users:getAll",
  GET_BY_ID = "users:getById",
  CREATE = "users:create",
  UPDATE = "users:update",
  DELETE = "users:delete",
  CHANGE_PASSWORD = "users:changePassword",
  TOGGLE_ACTIVE = "users:toggleActive",
}

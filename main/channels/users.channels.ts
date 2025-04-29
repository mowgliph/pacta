/**
 * Canales IPC relacionados con usuarios
 */
import {
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
  ChangePasswordRequest,
} from "../shared/types";

/**
 * Enumera los canales IPC para usuarios
 */
export enum UsersChannels {
  GET_ALL = "users:getAll",
  GET_BY_ID = "users:getById",
  CREATE = "users:create",
  UPDATE = "users:update",
  DELETE = "users:delete",
  TOGGLE_ACTIVE = "users:toggleActive",
  CHANGE_PASSWORD = "users:changePassword",
}

/**
 * Interfaz para solicitudes relacionadas con usuarios
 */
export interface UsersRequests {
  [UsersChannels.GET_ALL]: {
    request: { filters?: any };
    response: UsersListResponse;
  };
  [UsersChannels.GET_BY_ID]: {
    request: { id: string };
    response: { user: any };
  };
  [UsersChannels.CREATE]: {
    request: CreateUserRequest;
    response: { success: boolean; user: any; message?: string };
  };
  [UsersChannels.UPDATE]: {
    request: UpdateUserRequest;
    response: { success: boolean; user: any; message?: string };
  };
  [UsersChannels.DELETE]: {
    request: { id: string };
    response: { success: boolean; message?: string };
  };
  [UsersChannels.TOGGLE_ACTIVE]: {
    request: { id: string; isActive: boolean };
    response: { success: boolean; message?: string };
  };
  [UsersChannels.CHANGE_PASSWORD]: {
    request: ChangePasswordRequest;
    response: { success: boolean; message?: string };
  };
}

/**
 * Enumera los canales IPC para roles
 */
export enum RolesChannels {
  GET_ALL = "roles:getAll",
  GET_BY_ID = "roles:getById",
  CREATE = "roles:create",
  UPDATE = "roles:update",
  DELETE = "roles:delete",
}

/**
 * Interfaz para solicitudes relacionadas con roles
 */
export interface RolesRequests {
  [RolesChannels.GET_ALL]: {
    request: void;
    response: { roles: any[] };
  };
  [RolesChannels.GET_BY_ID]: {
    request: { id: string };
    response: { role: any };
  };
  [RolesChannels.CREATE]: {
    request: { name: string; description?: string; permissions: string[] };
    response: { success: boolean; role: any; message?: string };
  };
  [RolesChannels.UPDATE]: {
    request: {
      id: string;
      name?: string;
      description?: string;
      permissions?: string[];
    };
    response: { success: boolean; role: any; message?: string };
  };
  [RolesChannels.DELETE]: {
    request: { id: string };
    response: { success: boolean; message?: string };
  };
}

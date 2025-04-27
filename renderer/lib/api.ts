// Reemplazar la importación directa de electron con un acceso condicional
// import { ipcRenderer } from "electron";
import { QueryClient } from "@tanstack/react-query";
import {
  Contract,
  Supplement,
  User,
  Document,
  Roles,
  Backup,
} from "../types/index";
import apiClient from "./api-client";

// Acceso seguro a Electron desde el navegador
const ipcRenderer = typeof window !== 'undefined' && window.Electron 
  ? window.Electron.ipcRenderer 
  : { 
    invoke: () => Promise.reject(new Error('Electron no está disponible')) 
  };

// Crear y exportar el queryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Módulo de logging seguro
const safeLogger = {
  error(message: string, errorData?: any): void {
    // Mensaje estático que evita strings de formato dinámicas
    const safeMessage = typeof message === 'string' 
      ? message.replace(/\${.*?}/g, '[FILTERED]') 
      : 'Error logging';
    
    if (errorData) {
      console.error(safeMessage, errorData);
    } else {
      console.error(safeMessage);
    }
  },
  
  warn(message: string, data?: any): void {
    const safeMessage = typeof message === 'string' 
      ? message.replace(/\${.*?}/g, '[FILTERED]') 
      : 'Warning';
    
    if (data) {
      console.warn(safeMessage, data);
    } else {
      console.warn(safeMessage);
    }
  },
  
  info(message: string, data?: any): void {
    const safeMessage = typeof message === 'string' 
      ? message.replace(/\${.*?}/g, '[FILTERED]') 
      : 'Info';
    
    if (data) {
      console.info(safeMessage, data);
    } else {
      console.info(safeMessage);
    }
  }
};

// Funciones API para Contratos
export async function getContracts(params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Contract>> {
  try {
    return await ipcRenderer.invoke("contracts:getAll", params);
  } catch (error) {
    console.error("Error fetching contracts via IPC:", error);
    throw error;
  }
}

export async function getContractById(id: string): Promise<Contract> {
  try {
    return await ipcRenderer.invoke("contracts:getById", id);
  } catch (error) {
    safeLogger.error("Error fetching contract via IPC", { id, error });
    throw error;
  }
}

export async function createContract(
  contractData: Partial<Contract>
): Promise<Contract> {
  try {
    return await ipcRenderer.invoke("contracts:create", contractData);
  } catch (error) {
    safeLogger.error("Error creating contract via IPC", error);
    throw error;
  }
}

export async function deleteContract(id: string): Promise<void> {
  try {
    await ipcRenderer.invoke("contracts:delete", id);
  } catch (error) {
    safeLogger.error("Error deleting contract via IPC", { id, error });
    throw error;
  }
}

export async function updateContractStatus(
  id: string,
  status: string
): Promise<Contract> {
  try {
    return await ipcRenderer.invoke("contracts:updateStatus", { id, status });
  } catch (error) {
    safeLogger.error("Error updating contract status via IPC", { id, status, error });
    throw error;
  }
}

// Función para obtener estadísticas de contratos
export async function getContractsStats() {
  try {
    return await ipcRenderer.invoke("contracts:getStats");
  } catch (error) {
    safeLogger.error("Error fetching contracts stats via IPC", error);
    throw error;
  }
}

// Función para obtener contratos recientes
export async function getRecentContracts(limit: number = 5) {
  try {
    return await ipcRenderer.invoke("contracts:getRecent", limit);
  } catch (error) {
    safeLogger.error("Error fetching recent contracts via IPC", { limit, error });
    throw error;
  }
}

// Función para obtener contratos próximos a vencer
export async function getExpiringContracts(
  days: number = 30,
  limit: number = 5
) {
  try {
    return await ipcRenderer.invoke("contracts:getExpiring", { days, limit });
  } catch (error) {
    safeLogger.error("Error fetching expiring contracts via IPC", { days, limit, error });
    throw error;
  }
}

// Funciones API para Suplementos
// Función para obtener suplementos de un contrato
export async function getSupplements(
  contractId: string
): Promise<Supplement[]> {
  try {
    return await ipcRenderer.invoke("supplements:getByContract", contractId);
  } catch (error) {
    console.error(
      `Error fetching supplements for contract ${contractId} via IPC:`,
      error
    );
    throw error;
  }
}

// Función para obtener un suplemento por ID
export async function getSupplementById(id: string): Promise<Supplement> {
  try {
    return await ipcRenderer.invoke("supplements:getById", id);
  } catch (error) {
    console.error(`Error fetching supplement ${id} via IPC:`, error);
    throw error;
  }
}

// Función para crear un nuevo suplemento
export async function createSupplement(
  supplementData: Partial<Supplement>
): Promise<Supplement> {
  try {
    return await ipcRenderer.invoke("supplements:create", supplementData);
  } catch (error) {
    console.error("Error creating supplement via IPC:", error);
    throw error;
  }
}

// Función para eliminar un suplemento
export async function deleteSupplement(id: string): Promise<void> {
  try {
    await ipcRenderer.invoke("supplements:delete", id);
  } catch (error) {
    console.error(`Error deleting supplement ${id} via IPC:`, error);
    throw error;
  }
}

// Funciones API para Documentos
// Función para obtener documentos de un contrato
export async function getContractDocuments(
  contractId: string
): Promise<Document[]> {
  try {
    return await ipcRenderer.invoke("documents:getByContract", contractId);
  } catch (error) {
    console.error(
      `Error fetching documents for contract ${contractId} via IPC:`,
      error
    );
    throw error;
  }
}

// Función para subir un documento
export async function uploadDocument(
  file: File,
  metadata: {
    contractId?: string;
    supplementId?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }
): Promise<Document> {
  try {
    return await ipcRenderer.invoke("documents:upload", { file, metadata });
  } catch (error) {
    console.error("Error uploading document via IPC:", error);
    throw error;
  }
}

// Función para eliminar un documento
export async function deleteDocument(id: string): Promise<void> {
  try {
    await ipcRenderer.invoke("documents:delete", id);
  } catch (error) {
    console.error(`Error deleting document ${id} via IPC:`, error);
    throw error;
  }
}

// Funciones API para Dashboard
export async function getDashboardStats() {
  try {
    return await ipcRenderer.invoke("dashboard:getStats");
  } catch (error) {
    console.error("Error fetching dashboard stats via IPC:", error);
    throw error;
  }
}

export async function getDashboardActivityFeed(limit: number = 10) {
  try {
    return await ipcRenderer.invoke("dashboard:getActivityFeed", limit);
  } catch (error) {
    console.error("Error fetching dashboard activity feed via IPC:", error);
    throw error;
  }
}

// Funciones API para Usuarios
// Función para obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  try {
    return await ipcRenderer.invoke("users:getAll");
  } catch (error) {
    console.error("Error fetching users via IPC:", error);
    throw error;
  }
}

// Función para obtener un usuario por ID
export async function getUserById(id: string): Promise<User> {
  try {
    const data = await apiClient.get<User>(`/api/users/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
}

// Función para crear un nuevo usuario
export async function createUser(userData: Partial<User>): Promise<User> {
  try {
    return await ipcRenderer.invoke("users:create", userData);
  } catch (error) {
    console.error("Error creating user via IPC:", error);
    throw error;
  }
}

// Función para actualizar un usuario
export async function updateUser(
  id: string,
  userData: Partial<User>
): Promise<User> {
  try {
    return await ipcRenderer.invoke("users:update", { id, userData });
  } catch (error) {
    console.error(`Error updating user ${id} via IPC:`, error);
    throw error;
  }
}

// Función para cambiar la contraseña del usuario
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    await apiClient.post("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

// Funciones API para Backups
// Función para crear un nuevo respaldo
export async function createBackup(description?: string): Promise<Backup> {
  try {
    return await ipcRenderer.invoke("backups:create", description);
  } catch (error) {
    console.error("Error creating backup via IPC:", error);
    throw error;
  }
}

// Función para restaurar un respaldo
export async function restoreBackup(backupId: string): Promise<void> {
  try {
    await ipcRenderer.invoke("backups:restore", backupId);
  } catch (error) {
    console.error(`Error restoring backup ${backupId} via IPC:`, error);
    throw error;
  }
}

// Función para obtener todos los respaldos
export async function getBackups(): Promise<Backup[]> {
  try {
    return await ipcRenderer.invoke("backups:getAll");
  } catch (error) {
    console.error("Error fetching backups via IPC:", error);
    throw error;
  }
}

// Función para eliminar un respaldo
export async function deleteBackup(backupId: string): Promise<void> {
  try {
    await ipcRenderer.invoke("backups:delete", backupId);
  } catch (error) {
    console.error(`Error deleting backup ${backupId} via IPC:`, error);
    throw error;
  }
}

// Añadir estas nuevas funciones al final del archivo

// Funciones API para Roles
export async function getRoles(): Promise<Roles[]> {
  try {
    return await ipcRenderer.invoke("roles:getAll");
  } catch (error) {
    console.error("Error fetching roles via IPC:", error);
    throw error;
  }
}

// Función para actualizar permisos de un rol
export async function updateRolePermissions(
  roleId: string,
  permissions: Permissions
): Promise<Roles> {
  try {
    return await ipcRenderer.invoke("roles:updatePermissions", {
      roleId,
      permissions,
    });
  } catch (error) {
    console.error(
      `Error updating permissions for role ${roleId} via IPC:`,
      error
    );
    throw error;
  }
}

// Función para actualizar control de acceso de un contrato
export async function updateContractAccessControl(
  contractId: string,
  accessControl: {
    restricted: boolean;
    allowedRoles?: string[];
  }
): Promise<Contract> {
  try {
    return await ipcRenderer.invoke("contracts:updateAccessControl", {
      id: contractId,
      accessControl,
    });
  } catch (error) {
    console.error(
      `Error updating access control for contract ${contractId} via IPC:`,
      error
    );
    throw error;
  }
}

// Función para asignar usuarios a un contrato
export async function assignUsersToContract(
  contractId: string,
  userAssignments: Array<{
    userId: string;
    permissions: { [key: string]: boolean };
  }>
): Promise<Contract> {
  try {
    return await ipcRenderer.invoke("contracts:assignUsers", {
      id: contractId,
      userAssignments,
    });
  } catch (error) {
    console.error(
      `Error assigning users to contract ${contractId} via IPC:`,
      error
    );
    throw error;
  }
}

// Funciones adicionales para Roles
export async function createRole(
  roleData: Partial<Roles>
): Promise<Roles> {
  try {
    return await ipcRenderer.invoke("roles:create", roleData);
  } catch (error) {
    console.error("Error creating role via IPC:", error);
    throw error;
  }
}

export async function updateRole(
  roleId: string,
  roleData: Partial<Roles>
): Promise<Roles> {
  try {
    return await ipcRenderer.invoke("roles:update", {
      id: roleId,
      ...roleData
    });
  } catch (error) {
    console.error(`Error updating role ${roleId} via IPC:`, error);
    throw error;
  }
}

export async function deleteRole(roleId: string): Promise<void> {
  try {
    await ipcRenderer.invoke("roles:delete", { id: roleId });
  } catch (error) {
    console.error(`Error deleting role ${roleId} via IPC:`, error);
    throw error;
  }
}

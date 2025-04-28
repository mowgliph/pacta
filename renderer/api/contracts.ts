import { z } from 'zod';

// Definir canales IPC para comunicación con el proceso principal
// Estos deben coincidir con los definidos en main/ipc/channels/contracts.channels.ts
export const ContractsChannels = {
  GET_ALL: "contracts:getAll",
  GET_BY_ID: "contracts:getById",
  CREATE: "contracts:create",
  UPDATE: "contracts:update",
  DELETE: "contracts:delete",
  ASSIGN_USERS: "contracts:assignUsers",
  UPDATE_ACCESS: "contracts:updateAccess",
};

// Esquemas para validación en el lado del cliente
export const contractSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).nullable().optional(),
  status: z.string(),
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  createdById: z.string().uuid(),
  parties: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    role: z.string(),
    contact: z.string().nullable().optional(),
  })).optional(),
  supplements: z.array(z.any()).optional(),
});

export const createContractSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  status: z.string().default('draft'),
  amount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  parties: z.array(z.object({
    name: z.string(),
    role: z.string(),
    contact: z.string().optional(),
  })).optional(),
  tags: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateContractSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.string().optional(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  tags: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Servicios de API para contratos
export const contractsApi = {
  /**
   * Obtener lista de contratos con filtros opcionales
   */
  getContracts: async (filters = {}) => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.GET_ALL, filters);
  },

  /**
   * Obtener un contrato por ID
   */
  getContractById: async (id, includeDocuments = false) => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.GET_BY_ID, { id, includeDocuments });
  },

  /**
   * Crear un nuevo contrato
   */
  createContract: async (contractData) => {
    // Validar datos antes de enviar
    const validData = createContractSchema.parse(contractData);
    return window.Electron.ipcRenderer.invoke(ContractsChannels.CREATE, validData);
  },

  /**
   * Actualizar un contrato existente
   */
  updateContract: async (id, data) => {
    // Validar datos antes de enviar
    const validData = updateContractSchema.parse(data);
    return window.Electron.ipcRenderer.invoke(ContractsChannels.UPDATE, { 
      id, 
      data: {
        ...validData,
        updatedById: data.updatedById
      }
    });
  },

  /**
   * Eliminar un contrato
   */
  deleteContract: async (id, userId) => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.DELETE, { id, userId });
  },

  /**
   * Actualizar control de acceso de un contrato
   */
  updateAccess: async (id, accessControl, userId, userRole) => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.UPDATE_ACCESS, {
      id,
      accessControl,
      userId,
      userRole
    });
  },

  /**
   * Asignar usuarios a un contrato
   */
  assignUsers: async (id, userAssignments, userId, userRole) => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.ASSIGN_USERS, {
      id,
      userAssignments,
      userId,
      userRole
    });
  }
}; 
import { z } from "zod";
import { Contract } from "../types/contract";

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
  ADD_SUPPLEMENT: "contracts:addSupplement",
  UPDATE_STATUS: "contracts:updateStatus",
  CHECK_STATUSES: "contracts:checkStatuses",
};

// Tipos de estado de contrato
export type ContractStatus =
  | "Vigente"
  | "Próximo a Vencer"
  | "Vencido"
  | "Archivado";

// Esquemas para validación en el lado del cliente
export const contractSchema = z.object({
  id: z.string().uuid(),
  contractNumber: z.string(),
  title: z.string().min(3),
  description: z.string().optional(),
  parties: z.string(),
  signDate: z.string().or(z.date()),
  signPlace: z.string(),
  type: z.string(),
  companyName: z.string(),
  companyAddress: z.string(),
  nationality: z.string(),
  commercialAuth: z.string(),
  bankDetails: z.object({
    account: z.string(),
    branch: z.string(),
    agency: z.string(),
    holder: z.string(),
    currency: z.enum(["CUP", "MLC"]),
  }),
  reeupCode: z.string(),
  nit: z.string(),
  contactPhones: z.array(z.string()),
  legalRepresentative: z.object({
    name: z.string(),
    position: z.string(),
    documentType: z.string(),
    documentNumber: z.string(),
    documentDate: z.string().or(z.date()),
  }),
  providerObligations: z.array(z.string()),
  clientObligations: z.array(z.string()),
  deliveryPlace: z.string(),
  deliveryTerm: z.string(),
  acceptanceProcedure: z.string(),
  value: z.number(),
  currency: z.enum(["MN", "MLC"]),
  paymentMethod: z.string(),
  paymentTerm: z.string(),
  warrantyTerm: z.string(),
  warrantyScope: z.string(),
  technicalStandards: z.string().optional(),
  claimProcedure: z.string(),
  disputeResolution: z.string(),
  latePaymentInterest: z.string(),
  breachPenalties: z.string(),
  notificationMethods: z.array(z.string()),
  minimumNoticeTime: z.string(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  extensionTerms: z.string(),
  earlyTerminationNotice: z.string(),
  forceMajeure: z.string(),
  attachments: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      documentUrl: z.string().optional(),
    })
  ),
  status: z.enum(["Vigente", "Próximo a Vencer", "Vencido", "Archivado"]),
  isRestricted: z.boolean(),
  createdById: z.string().uuid(),
  ownerId: z.string().uuid(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  createdBy: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  owner: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

export const createContractSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  status: z.string().default("draft"),
  amount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  parties: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        contact: z.string().optional(),
      })
    )
    .optional(),
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

// Esquema para validación de suplementos
export const supplementSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  changedField: z.string(), // Campo que se modifica en el contrato
  previousValue: z.any(), // Valor anterior
  newValue: z.any(), // Nuevo valor
  effectiveDate: z.string().or(z.date()),
  createdById: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

// Interfaces para tipos de datos
interface AccessControl {
  userId: string;
  role: string;
}

interface UpdateAccessParams {
  id: string;
  accessControl: AccessControl[];
  userId: string;
  userRole: string;
}

// Servicios de API para contratos
export const contractsApi = {
  /**
   * Obtener todos los contratos
   */
  getContracts: async (userId: string) => {
    return window.Electron.ipcRenderer.invoke(
      ContractsChannels.GET_ALL,
      userId
    );
  },

  /**
   * Obtener un contrato por ID
   */
  getContractById: async (id: string, userId: string) => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.GET_BY_ID, {
      id,
      userId,
    });
  },

  /**
   * Crear un nuevo contrato
   */
  createContract: async (
    contractData: z.infer<typeof createContractSchema>,
    userId: string
  ) => {
    const validData = createContractSchema.parse(contractData);
    return window.Electron.ipcRenderer.invoke(ContractsChannels.CREATE, {
      contract: validData,
      userId,
    });
  },

  /**
   * Actualizar un contrato existente
   */
  updateContract: async (
    id: string,
    data: z.infer<typeof updateContractSchema>,
    userId: string
  ) => {
    const validData = updateContractSchema.parse(data);
    return window.Electron.ipcRenderer.invoke(ContractsChannels.UPDATE, {
      id,
      contract: validData,
      userId,
    });
  },

  /**
   * Eliminar un contrato
   */
  deleteContract: async (id: string, userId: string) => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.DELETE, {
      id,
      userId,
    });
  },

  /**
   * Actualizar control de acceso de un contrato
   */
  updateAccess: async ({
    id,
    accessControl,
    userId,
    userRole,
  }: UpdateAccessParams): Promise<void> => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.UPDATE_ACCESS, {
      id,
      accessControl,
      userId,
      userRole,
    });
  },

  /**
   * Asignar usuarios a un contrato
   */
  assignUsers: async ({
    id,
    accessControl,
    userId,
    userRole,
  }: UpdateAccessParams): Promise<void> => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.ASSIGN_USERS, {
      id,
      accessControl,
      userId,
      userRole,
    });
  },

  /**
   * Crear un suplemento para un contrato
   */
  createSupplement: async (
    contractId: string,
    supplementData: z.infer<typeof supplementSchema>,
    userId: string
  ): Promise<void> => {
    return window.Electron.ipcRenderer.invoke(
      ContractsChannels.ADD_SUPPLEMENT,
      {
        contractId,
        supplement: supplementData,
        userId,
      }
    );
  },

  /**
   * Actualizar el estado de un contrato
   */
  updateContractStatus: async (
    id: string,
    status: ContractStatus,
    userId: string
  ): Promise<void> => {
    return window.Electron.ipcRenderer.invoke(ContractsChannels.UPDATE_STATUS, {
      id,
      status,
      userId,
    });
  },

  /**
   * Verificar y actualizar estados de contratos automáticamente
   */
  checkAndUpdateContractStatuses: async (userId: string): Promise<void> => {
    return window.Electron.ipcRenderer.invoke(
      ContractsChannels.CHECK_STATUSES,
      userId
    );
  },
};

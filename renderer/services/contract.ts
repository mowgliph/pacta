// renderer/services/contract.ts
import { ipcRenderer } from "electron";
import type {
  Contract,
  ContractWithDetails,
  ContractsListResponse,
  CreateContractRequest,
  UpdateContractRequest,
} from "../types/contract";

export const contractService = {
  /**
   * Obtiene la lista de contratos con filtros opcionales
   */
  async getContracts(filters?: any): Promise<ContractsListResponse> {
    return await ipcRenderer.invoke("contracts:getAll", filters);
  },

  /**
   * Obtiene un contrato por su ID
   */
  async getContractById(id: string): Promise<ContractWithDetails> {
    return await ipcRenderer.invoke("contracts:getById", { id });
  },

  /**
   * Crea un nuevo contrato
   */
  async createContract(
    contractData: CreateContractRequest
  ): Promise<{ success: boolean; contract: Contract; message?: string }> {
    return await ipcRenderer.invoke("contracts:create", contractData);
  },

  /**
   * Actualiza un contrato existente
   */
  async updateContract(
    id: string,
    contractData: UpdateContractRequest
  ): Promise<{ success: boolean; contract: Contract; message?: string }> {
    return await ipcRenderer.invoke("contracts:update", {
      id,
      data: contractData,
    });
  },

  /**
   * Elimina un contrato
   */
  async deleteContract(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    return await ipcRenderer.invoke("contracts:delete", { id });
  },

  /**
   * Actualiza el control de acceso de un contrato
   */
  async updateContractAccessControl(
    id: string,
    accessControl: { isRestricted: boolean }
  ): Promise<{ success: boolean; contract: Contract; message?: string }> {
    return await ipcRenderer.invoke("contracts:updateAccess", {
      id,
      accessControl,
    });
  },

  /**
   * Asigna usuarios a un contrato
   */
  async assignUsersToContract(
    id: string,
    userAssignments: { userId: string; role: "viewer" | "editor" | "admin" }[]
  ): Promise<{ success: boolean; assignments: any[]; message?: string }> {
    return await ipcRenderer.invoke("contracts:assignUsers", {
      id,
      userAssignments,
    });
  },

  /**
   * Actualiza el estado de un contrato
   */
  async updateContractStatus(
    id: string,
    newStatus: string
  ): Promise<{ success: boolean; contract: Contract }> {
    return await ipcRenderer.invoke("contracts:update-status", {
      contractId: id,
      newStatus,
    });
  },

  /**
   * Verifica y actualiza el estado de todos los contratos
   */
  async checkContractStatuses(): Promise<{ success: boolean }> {
    return await ipcRenderer.invoke("contracts:check-statuses");
  },
};

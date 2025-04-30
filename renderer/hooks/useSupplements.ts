import { useState } from "react";
import {
  Supplement,
  CreateSupplementPayload,
  UpdateSupplementPayload,
  SupplementChannels,
  SupplementStatus,
} from "@/types/supplement.types";

export const useSupplements = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllSupplements = async (): Promise<Supplement[]> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const supplements = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.GET_ALL
      );
      return supplements;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener suplementos"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getSupplementsByContract = async (
    contractId: string
  ): Promise<Supplement[]> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const supplements = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.GET_BY_CONTRACT,
        contractId
      );
      return supplements;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener suplementos del contrato"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createSupplement = async (
    payload: CreateSupplementPayload
  ): Promise<Supplement | null> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const supplement = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.CREATE,
        payload
      );
      return supplement;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear suplemento"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupplement = async (
    id: string,
    payload: UpdateSupplementPayload
  ): Promise<Supplement | null> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const supplement = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.UPDATE,
        id,
        payload
      );
      return supplement;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar suplemento"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const approveSupplement = async (id: string): Promise<Supplement | null> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const supplement = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.APPROVE,
        id
      );
      return supplement;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al aprobar suplemento"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectSupplement = async (id: string): Promise<Supplement | null> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const supplement = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.REJECT,
        id
      );
      return supplement;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al rechazar suplemento"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getAllSupplements,
    getSupplementsByContract,
    createSupplement,
    updateSupplement,
    approveSupplement,
    rejectSupplement,
  };
};

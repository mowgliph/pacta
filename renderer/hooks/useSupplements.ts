import { useState } from "react";
import { toast } from "./use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Supplement,
  CreateSupplementPayload,
  UpdateSupplementPayload,
  ApproveSupplementPayload,
  SupplementChannels,
  SupplementStatus,
} from "@/types/supplement.types";

export const useSupplements = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getAllSupplements = async (): Promise<Supplement[]> => {
    try {
      setIsLoading(true);
      setError(null);
      // @ts-ignore - Electron está expuesto por el preload script
      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.GET_ALL
      );
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al obtener suplementos";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getSupplementById = async (id: string): Promise<Supplement | null> => {
    try {
      setIsLoading(true);
      setError(null);
      // @ts-ignore - Electron está expuesto por el preload script
      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.GET_BY_ID,
        id
      );
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al obtener el suplemento";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSupplementsByContract = async (
    contractId: string
  ): Promise<Supplement[]> => {
    try {
      setIsLoading(true);
      setError(null);
      // @ts-ignore - Electron está expuesto por el preload script
      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.GET_BY_CONTRACT,
        contractId
      );
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al obtener suplementos del contrato";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
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
      setError(null);
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // @ts-ignore - Electron está expuesto por el preload script
      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.CREATE,
        payload,
        user.id
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      toast({
        title: "Éxito",
        description: "Suplemento creado correctamente",
      });

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear suplemento";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
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
      setError(null);
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.UPDATE,
        payload,
        user.id
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      toast({
        title: "Éxito",
        description: "Suplemento actualizado correctamente",
      });

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al actualizar suplemento";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const approveSupplement = async (
    supplementId: string
  ): Promise<Supplement | null> => {
    try {
      setIsLoading(true);
      setError(null);
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const payload: ApproveSupplementPayload = {
        supplementId,
        approvedById: user.id,
      };

      // @ts-ignore - Electron está expuesto por el preload script
      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.APPROVE,
        payload,
        user.id
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      toast({
        title: "Éxito",
        description: "Suplemento aprobado correctamente",
      });

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al aprobar suplemento";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectSupplement = async (
    supplementId: string
  ): Promise<Supplement | null> => {
    try {
      setIsLoading(true);
      setError(null);
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // @ts-ignore - Electron está expuesto por el preload script
      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.REJECT,
        supplementId,
        user.id
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      toast({
        title: "Éxito",
        description: "Suplemento rechazado correctamente",
      });

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al rechazar suplemento";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const searchSupplements = async (query: string): Promise<Supplement[]> => {
    try {
      setIsLoading(true);
      setError(null);
      // @ts-ignore - Electron está expuesto por el preload script
      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.SEARCH,
        query
      );
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al buscar suplementos";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getPendingSupplements = async (): Promise<Supplement[]> => {
    try {
      setIsLoading(true);
      setError(null);
      // @ts-ignore - Electron está expuesto por el preload script
      const response = await window.Electron.ipcRenderer.invoke(
        SupplementChannels.GET_PENDING
      );
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al obtener suplementos pendientes";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getAllSupplements,
    getSupplementById,
    getSupplementsByContract,
    createSupplement,
    updateSupplement,
    approveSupplement,
    rejectSupplement,
    searchSupplements,
    getPendingSupplements,
  };
};

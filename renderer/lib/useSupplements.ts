import { useState, useCallback, useRef, useEffect } from "react";
import { useFileDialog } from "@/lib/useFileDialog";
import { useNotification } from "@/lib/useNotification";
import type { 
  Supplement, 
  SupplementsApi, 
  IpcRenderer,
  ApiResponse
} from "../types/electron.d";
import { errorMessages, notificationMessages } from "./errorMessages";

// Helper para obtener el renderer de IPC de manera segura
const getIpcRenderer = (): IpcRenderer | null => {
  return typeof window !== "undefined" && window.electron.ipcRenderer 
    ? window.electron.ipcRenderer 
    : null;
};

// Helper para obtener la API de suplementos de manera segura
const getSupplementsApi = (): SupplementsApi | null => {
  return typeof window !== "undefined" && window.electron.supplements
    ? window.electron.supplements
    : null;
};

interface UseSupplementsResult {
  supplements: Supplement[];
  isLoading: boolean;
  error: string | null;
  fetchSupplements: () => Promise<void>;
  downloadSupplement: (supplementId: string) => Promise<void>;
  createSupplement: (data: Omit<Supplement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Supplement | null>;
  updateSupplement: (id: string, data: Partial<Supplement>) => Promise<Supplement | null>;
  deleteSupplement: (id: string) => Promise<boolean>;
}

export const useSupplements = (contractId: string): UseSupplementsResult => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { saveFile, openFile } = useFileDialog();
  const { notify } = useNotification();
  const abortController = useRef<AbortController | null>(null);

  // Limpiar solicitudes pendientes al desmontar
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const handleApiError = useCallback((error: unknown, defaultMessage: string): string => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("api-error", {
        detail: {
          error: errorMessage,
          type: 'supplements-error'
        }
      }));
    }
    
    return errorMessage;
  }, []);

  const fetchSupplements = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    const ipc = getIpcRenderer();
    if (!ipc) {
      handleApiError(new Error("API no disponible"), errorMessages.apiUnavailable);
      setIsLoading(false);
      return;
    }

    try {
      const response = await ipc.invoke(
        "supplements:list", 
        contractId,
        { signal: abortController.current.signal }
      ) as ApiResponse<Supplement[]>;

      if (!response.success) {
        throw new Error(response.error?.message || errorMessages.fetchError);
      }

      setSupplements(response.data || []);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const message = handleApiError(error, errorMessages.fetchError);
        notify({
          title: "Error",
          body: message,
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [contractId, handleApiError, notify]);

  const downloadSupplement = useCallback(async (supplementId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const supplementsApi = getSupplementsApi();
    if (!supplementsApi) {
      handleApiError(new Error("API no disponible"), errorMessages.apiUnavailable);
      setIsLoading(false);
      return;
    }

    try {
      const supplement = supplements.find(s => s.id === supplementId);
      if (!supplement) {
        throw new Error("Suplemento no encontrado");
      }

      const fileResult = await saveFile({
        title: "Guardar suplemento",
        defaultPath: supplement.fileName || `Suplemento_${supplementId}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });

      if (!fileResult?.filePath) {
        notify({
          title: notificationMessages.warning.cancelled,
          body: "Operación cancelada por el usuario",
          variant: "warning",
        });
        return;
      }

      const response = await supplementsApi.export(supplementId);
      if (!response.success) {
        throw new Error(response.error?.message);
      }

      notify({
        title: "Éxito",
        body: notificationMessages.success.export,
        variant: "success",
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const message = handleApiError(error, errorMessages.exportError);
        notify({
          title: "Error al exportar",
          body: message,
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [supplements, saveFile, notify, handleApiError]);

  const createSupplement = useCallback(async (
    data: Omit<Supplement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Supplement | null> => {
    setIsLoading(true);
    setError(null);

    const supplementsApi = getSupplementsApi();
    if (!supplementsApi) {
      handleApiError(new Error("API no disponible"), errorMessages.apiUnavailable);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await supplementsApi.create(contractId, data);
      if (!response.success) {
        throw new Error(response.error?.message);
      }

      await fetchSupplements();
      notify({
        title: "Éxito",
        body: "Suplemento creado correctamente",
        variant: "success",
      });
      
      return response.data || null;
    } catch (error) {
      const message = handleApiError(error, errorMessages.connectionError);
      notify({
        title: "Error al crear",
        body: message,
        variant: "error",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contractId, fetchSupplements, notify, handleApiError]);

  const updateSupplement = useCallback(async (
    id: string,
    data: Partial<Supplement>
  ): Promise<Supplement | null> => {
    setIsLoading(true);
    setError(null);

    const supplementsApi = getSupplementsApi();
    if (!supplementsApi) {
      handleApiError(new Error("API no disponible"), errorMessages.apiUnavailable);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await supplementsApi.update(id, data);
      if (!response.success) {
        throw new Error(response.error?.message);
      }

      await fetchSupplements();
      notify({
        title: "Éxito",
        body: "Suplemento actualizado correctamente",
        variant: "success",
      });
      
      return response.data || null;
    } catch (error) {
      const message = handleApiError(error, errorMessages.connectionError);
      notify({
        title: "Error al actualizar",
        body: message,
        variant: "error",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSupplements, notify, handleApiError]);

  const deleteSupplement = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const supplementsApi = getSupplementsApi();
    if (!supplementsApi) {
      handleApiError(new Error("API no disponible"), errorMessages.apiUnavailable);
      setIsLoading(false);
      return false;
    }

    try {
      const response = await supplementsApi.delete(id);
      if (!response.success) {
        throw new Error(response.error?.message);
      }

      await fetchSupplements();
      notify({
        title: "Éxito",
        body: "Suplemento eliminado correctamente",
        variant: "success",
      });
      
      return true;
    } catch (error) {
      const message = handleApiError(error, errorMessages.connectionError);
      notify({
        title: "Error al eliminar",
        body: message,
        variant: "error",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSupplements, notify, handleApiError]);

  return {
    supplements,
    isLoading,
    error,
    fetchSupplements,
    downloadSupplement,
    createSupplement,
    updateSupplement,
    deleteSupplement,
  };
};
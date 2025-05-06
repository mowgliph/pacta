import { useState, useCallback } from "react";
import { handleIpcResponse } from "./handleIpcResponse";

export interface Supplement {
  id: string;
  contractId: string;
  field: string;
  oldValue: string;
  newValue: string;
  description: string;
  createdAt: string;
  fileName?: string;
}

export const useSupplements = (contractId: string) => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // @ts-ignore
      const res = await window.Electron.ipcRenderer.invoke(
        "supplements:list",
        contractId
      );
      setSupplements(handleIpcResponse<Supplement[]>(res));
    } catch (err: any) {
      setError(err?.message || "No se pudieron obtener los suplementos.");
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  const downloadSupplement = useCallback(async (supplementId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // @ts-ignore
      const res = await window.Electron.ipcRenderer.invoke(
        "supplements:download",
        supplementId
      );
      handleIpcResponse(res);
      // Aquí puedes mostrar una notificación de éxito si lo deseas
    } catch (err: any) {
      setError(err?.message || "No se pudo descargar el suplemento.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    supplements,
    isLoading,
    error,
    fetchSupplements,
    downloadSupplement,
  };
};

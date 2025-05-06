import { useState, useCallback } from "react";
import { handleIpcResponse } from "./handleIpcResponse";
import { useFileDialog } from "@/lib/useFileDialog";
import { useNotification } from "@/lib/useNotification";

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

function getIpcRenderer() {
  if (typeof window !== "undefined" && window.Electron?.ipcRenderer) {
    // @ts-ignore
    return window.Electron.ipcRenderer;
  }
  return null;
}

function getSupplementsApi() {
  if (typeof window !== "undefined" && (window as any).Electron?.supplements) {
    return (window as any).Electron.supplements;
  }
  return null;
}

export const useSupplements = (contractId: string) => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveFile } = useFileDialog();
  const { notify } = useNotification();

  const fetchSupplements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const ipc = getIpcRenderer();
    if (!ipc) {
      setError("API de suplementos no disponible");
      setIsLoading(false);
      return;
    }
    try {
      const res = await ipc.invoke("supplements:list", contractId);
      setSupplements(handleIpcResponse<Supplement[]>(res));
    } catch (err: any) {
      setError(err?.message || "Error al obtener suplementos");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-error"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  const downloadSupplement = useCallback(
    async (supplementId: string) => {
      setIsLoading(true);
      setError(null);
      const supplementsApi = getSupplementsApi();
      if (!supplementsApi) {
        setError("API de suplementos no disponible");
        setIsLoading(false);
        return;
      }
      try {
        const supplement = supplements.find((s) => s.id === supplementId);
        const fileResult = await saveFile({
          title: "Guardar suplemento",
          defaultPath: supplement?.fileName || "Suplemento.pdf",
          filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (!fileResult || !fileResult.filePath) {
          notify({
            title: "Descarga cancelada",
            body: "No se seleccionó ninguna ruta para guardar.",
            variant: "warning",
          });
          return;
        }
        const res = await supplementsApi.export(
          supplementId,
          fileResult.filePath
        );
        handleIpcResponse(res);
        notify({
          title: "Suplemento exportado",
          body: "El suplemento fue exportado correctamente.",
          variant: "success",
        });
      } catch (err: any) {
        setError(err?.message || "No se pudo descargar el suplemento.");
        notify({
          title: "Error",
          body: "No se pudo exportar el suplemento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [saveFile, notify, supplements]
  );

  return {
    supplements,
    isLoading,
    error,
    fetchSupplements,
    downloadSupplement,
  };
};

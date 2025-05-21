import { useState, useCallback } from "react";
import { useFileDialog } from "@/lib/useFileDialog";
import { useNotification } from "@/lib/useNotification";
import type { Supplement, SupplementsResponse, SupplementsAPI, IpcRenderer } from "../types/electron.d";
import { errorMessages, notificationMessages } from "./errorMessages";


function getIpcRenderer(): IpcRenderer | null {
  if (typeof window !== "undefined" && window.Electron?.ipcRenderer) {
    return window.Electron.ipcRenderer;
  }
  return null;
}

function getSupplementsApi(): SupplementsAPI | null {
  if (typeof window !== "undefined" && window.Electron?.supplements) {
    return window.Electron.supplements;
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
      const response = await ipc.invoke("supplements:list", contractId) as SupplementsResponse;
      setSupplements(response.data);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : errorMessages.fetchError;
      setError(errorMessage);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-error", {
          detail: {
            error: errorMessage,
            type: 'supplements-error' as const
          }
        }));
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
        if (!supplement) {
          throw new Error(errorMessages.apiUnavailable);
        }

        const fileResult = await saveFile({
          title: "Guardar suplemento",
          defaultPath: supplement.fileName || "Suplemento.pdf",
          filters: [{ name: "PDF", extensions: ["pdf"] }],
        });

        if (!fileResult || !fileResult.filePath) {
          notify({
            title: notificationMessages.warning.cancelled,
            body: "No se seleccionó ninguna ruta para guardar.",
            variant: "warning",
          });
          return;
        }

        const response = await supplementsApi.export(
          supplementId,
          fileResult.filePath
        ) as SupplementsResponse;

        if (!response.success) {
          throw new Error(response.error?.message || errorMessages.exportError);
        }

        notify({
          title: "Suplemento exportado",
          body: notificationMessages.success.export,
          variant: "success",
        });
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : errorMessages.exportError;
        setError(errorMessage);
        notify({
          title: "Error",
          body: notificationMessages.error.export,
          variant: "error",
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

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

export const useSupplements = (contractId: string) => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveFile } = useFileDialog();
  const { notify } = useNotification();

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
      setError(err?.message || "Error al obtener suplementos");
      // Lanzar evento global para manejo de error 500
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
        // @ts-ignore
        const res = await window.Electron.supplements.export(
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

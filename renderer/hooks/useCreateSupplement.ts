import { useState } from "react";

export function useCreateSupplement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createSupplement = async (params: {
    contractId: string;
    field: string;
    newValue: string;
    description: string;
    file?: File | null;
  }) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      let documentId = null;
      if (params.file) {
        const arrayBuffer = await params.file.arrayBuffer();
        // @ts-ignore
        const uploadRes = await window.Electron.ipcRenderer.invoke(
          "documents:upload",
          {
            contractId: params.contractId,
            supplementId: undefined, // Se asociará después
            uploadedById: undefined, // Rellenar con el usuario actual si está disponible
          },
          {
            name: params.file.name,
            type: params.file.type || "application/pdf",
            data: Array.from(new Uint8Array(arrayBuffer)),
          }
        );
        if (uploadRes?.success && uploadRes.data?.id) {
          documentId = uploadRes.data.id;
        }
      }
      // @ts-ignore
      const res = await window.Electron.supplements.create({
        ...params,
        documentId,
      });
      if (res.success) {
        setSuccess("Suplemento creado correctamente.");
        return { success: true, data: res.data };
      } else {
        setError(res.error?.message || "No se pudo crear el suplemento.");
        return { success: false, error: res.error };
      }
    } catch (err: any) {
      setError(err?.message || "Error de conexión");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { createSupplement, loading, error, success, setError, setSuccess };
}

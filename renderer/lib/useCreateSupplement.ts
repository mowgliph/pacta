"use client";
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
      // @ts-ignore
      const res = await window.Electron.supplements.create(params);
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

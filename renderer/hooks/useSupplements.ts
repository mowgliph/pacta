import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { Supplement } from "../types";

export function useSupplements(contractId?: string) {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (contractId) {
      fetchSupplements();
    }
  }, [contractId]);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.Electron.ipcRenderer.invoke(
        "supplements:getByContract",
        contractId
      );
      setSupplements(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los suplementos"
      );
      toast({
        title: "Error",
        description: "No se pudieron cargar los suplementos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplement = async (supplementId: string) => {
    try {
      setLoading(true);
      setError(null);
      await window.Electron.ipcRenderer.invoke(
        "supplements:delete",
        supplementId
      );
      setSupplements(supplements.filter((s) => s.id !== supplementId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el suplemento"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSupplement = async (
    data: Omit<
      Supplement,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "approvedBy"
      | "documents"
    >
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await window.Electron.ipcRenderer.invoke(
        "supplements:create",
        data
      );
      setSupplements((prev) => [...prev, response]);
      toast({
        title: "Éxito",
        description: "Suplemento creado correctamente",
      });
      return response;
    } catch (err) {
      setError("Error al crear el suplemento");
      toast({
        title: "Error",
        description: "No se pudo crear el suplemento",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveSupplement = async (
    supplementId: string,
    approvedById: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await window.Electron.ipcRenderer.invoke(
        "supplements:approve",
        { supplementId, approvedById }
      );
      setSupplements((prev) =>
        prev.map((s) => (s.id === supplementId ? response : s))
      );
      toast({
        title: "Éxito",
        description: "Suplemento aprobado correctamente",
      });
      return response;
    } catch (err) {
      setError("Error al aprobar el suplemento");
      toast({
        title: "Error",
        description: "No se pudo aprobar el suplemento",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    supplements,
    loading,
    error,
    deleteSupplement,
    fetchSupplements,
    createSupplement,
    approveSupplement,
  };
}

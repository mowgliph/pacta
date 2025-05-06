"use client";
import { useEffect, useState } from "react";
import type { Contract } from "./useContracts";
import { handleIpcResponse } from "./handleIpcResponse";

export interface Supplement {
  id: string;
  contractId: string;
  field: string;
  oldValue: string;
  newValue: string;
  description: string;
  createdAt: string;
}

export function useContractDetail(id: string) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([
      // @ts-ignore
      window.Electron.ipcRenderer.invoke("contracts:getById", id),
      // @ts-ignore
      window.Electron.ipcRenderer.invoke("supplements:list", id),
    ])
      .then(([cRes, sRes]: any[]) => {
        if (!mounted) return;
        try {
          setContract(handleIpcResponse<Contract>(cRes));
          setSupplements(handleIpcResponse<Supplement[]>(sRes));
        } catch (err: any) {
          setError(
            err?.message || "No se pudo cargar el contrato o suplementos"
          );
        }
      })
      .catch((err: any) => {
        if (mounted) setError(err?.message || "Error de conexión");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  return { contract, supplements, loading, error };
}

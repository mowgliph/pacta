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
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([
      window.electron.ipcRenderer.invoke("contracts:getById", id),
      window.electron.ipcRenderer.invoke("supplements:list", id),
      window.electron.ipcRenderer.invoke("documents:getByContract", id),
    ])
      .then(([cRes, sRes, dRes]: any[]) => {
        if (!mounted) return;
        try {
          setContract(handleIpcResponse<Contract>(cRes));
          setSupplements(handleIpcResponse<Supplement[]>(sRes));
          setDocuments(handleIpcResponse<any[]>(dRes));
        } catch (err: any) {
          setError(err?.message || "Error al obtener detalles del contrato");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("api-error"));
          }
        }
      })
      .catch((err: any) => {
        if (mounted) {
          setError(err?.message || "Error de conexión");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("api-error"));
          }
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  return { contract, supplements, documents, loading, error };
}

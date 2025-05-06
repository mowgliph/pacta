"use client";
import { useEffect, useState } from "react";
import { handleIpcResponse } from "./handleIpcResponse";

export interface Contract {
  id: string;
  number: string;
  company: string;
  type: "Cliente" | "Proveedor";
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
  description: string;
  attachment?: string | null;
}

export function useContracts(tipo?: "Cliente" | "Proveedor") {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    // @ts-ignore
    window.Electron.ipcRenderer
      .invoke("contracts:list", tipo ? { tipo } : {})
      .then((res: any) => {
        if (!mounted) return;
        try {
          setContracts(handleIpcResponse<Contract[]>(res));
        } catch (err: any) {
          setError(err?.message || "Error al obtener contratos");
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
  }, [tipo]);

  return { contracts, loading, error };
}

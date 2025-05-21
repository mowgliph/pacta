"use client";
import { useEffect, useState } from "react";
import { handleIpcResponse, IpcResponse } from "./handleIpcResponse";

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

    // Verificar entorno
    if (typeof window === 'undefined') {
      console.error('No se puede acceder a Electron en el servidor');
      setError('Error de entorno: No se puede acceder a Electron');
      setLoading(false);
      return;
    }

    console.log('useContracts: Entorno verificado');

    // Verificar Electron
    if (!window.Electron?.ipcRenderer) {
      console.error('Electron no está disponible');
      setError("API de contratos no disponible");
      setLoading(false);
      return;
    }
    console.log('useContracts: Electron verificado');

    console.log('Intentando listar contratos...');
    window.Electron.ipcRenderer
      .invoke("contracts:list", tipo ? { tipo } : {})
      .then((res: IpcResponse<Contract[]>) => {
        console.log('useContracts: Respuesta recibida');
        if (!mounted) return;
        console.log('Respuesta recibida:', res);
        try {
          const contracts = handleIpcResponse<Contract[]>(res);
          console.log('Contratos procesados:', contracts);
          setContracts(contracts);
        } catch (err) {
          console.error('Error al procesar respuesta:', err);
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      })
      .catch((err) => {
        console.error('Error en la llamada IPC:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error de conexión');
          window.dispatchEvent(new CustomEvent("api-error", {
            detail: {
              error: err instanceof Error ? err.message : 'Error desconocido',
              type: 'ipc-error' as const
            }
          }));
        }
      })
      .finally(() => {
        console.log('useContracts: Finalizando efecto');
        if (mounted) setLoading(false);
      });
    return () => {
      console.log('useContracts: Limpiando efecto');
      mounted = false;
    };
  }, [tipo]);

  return { contracts, loading, error };
}

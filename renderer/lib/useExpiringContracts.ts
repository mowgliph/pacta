"use client";
import { useState, useEffect } from "react";
import type { Contract } from "./useContracts";
import { handleIpcResponse, type IpcResponse } from "./handleIpcResponse";

/**
 * Hook para obtener los contratos próximos a vencer
 * @returns Objeto con los contratos próximos a vencer, estado de carga y errores
 */
export function useExpiringContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchExpiringContracts = async () => {
      try {
        if (!window.Electron?.ipcRenderer) {
          throw new Error("API de contratos no disponible. Por favor, recargue la aplicación.");
        }

        const response = await window.Electron.ipcRenderer.invoke("contracts:list", {
          status: "Próximo a Vencer"
        }) as IpcResponse<Contract[]>;

        if (!mounted) return;

        try {
          const contractsData = handleIpcResponse<Contract[]>(response);
          setContracts(contractsData || []);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Error al procesar los datos de los contratos";
          console.error("Error en useExpiringContracts:", errorMessage, err);
          setError(errorMessage);
          
          // Disparar evento de error global
          window.dispatchEvent(new CustomEvent("api-error", {
            detail: {
              error: errorMessage,
              type: "contracts-error"
            }
          }));
        }
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error 
          ? `Error al cargar contratos: ${err.message}` 
          : "Error de conexión con el servidor";
          
        console.error("Error en useExpiringContracts:", errorMessage, err);
        setError(errorMessage);
        
        // Disparar evento de error global
        window.dispatchEvent(new CustomEvent("api-error", {
          detail: {
            error: errorMessage,
            type: "ipc-error"
          }
        }));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchExpiringContracts();

    return () => {
      mounted = false;
    };
  }, []);

  return { contracts, loading, error };
}


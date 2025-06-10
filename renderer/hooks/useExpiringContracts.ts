import { useState, useEffect } from "react";
import type { Contract } from "./useContracts";
import { handleIpcResponse, type IpcResponse } from "../lib/handleIpcResponse";

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
        // Verificar que Electron esté disponible
        if (typeof window.electron === 'undefined') {
          throw new Error("La aplicación debe ejecutarse en el entorno de Electron. Por favor, inicie la aplicación desde el ejecutable.");
        }

        // Verificar que la API de contratos esté disponible
        const electron = window.electron as any; // Aserción temporal
        if (!electron.contracts) {
          throw new Error("No se pudo acceder al módulo de contratos");
        }

        // Usar la API de contratos
        console.log('Buscando contratos próximos a vencer...');
        const response = await electron.contracts.list({
          status: "Próximo a Vencer"
        });

        if (!mounted) return;

        try {
          console.log('Respuesta de la API de contratos:', response);
          
          // Verificar si la respuesta es exitosa
          if (!response.success) {
            throw new Error(response.error?.message || 'Error al obtener los contratos');
          }
          
          // Asegurarse de que los datos sean un array
          let contractsData = [];
          if (Array.isArray(response.data)) {
            contractsData = response.data;
          } else if (response.data && typeof response.data === 'object') {
            // Si la respuesta tiene un formato diferente, intentar extraer los contratos
            if (response.data.items && Array.isArray(response.data.items)) {
              contractsData = response.data.items;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              contractsData = response.data.data;
            } else {
              // Si no se puede encontrar un array, usar los valores del objeto
              contractsData = Object.values(response.data);
            }
          }
          
          console.log(`Se encontraron ${contractsData.length} contratos próximos a vencer`);
          setContracts(contractsData);
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


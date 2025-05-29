import { useEffect, useState } from "react";
import { PaginationResponse, ApiResponse } from "../types/electron.d";
import { ArchivedContract } from "../types/contracts";

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

interface UseContractsOptions {
  tipo?: "Cliente" | "Proveedor";
  status?: string;
}

export function useContracts({ tipo, status }: UseContractsOptions = {}) {
  // Inicializar el estado de contratos
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para extraer el mensaje de error de la respuesta
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
    if (!error || typeof error !== "object")
      return "Error desconocido al cargar los contratos";

    // Manejar error anidado
    const nestedError = error as { error?: { message?: unknown } };
    if (nestedError.error && typeof nestedError.error === "object") {
      if (nestedError.error.message) {
        return String(nestedError.error.message);
      }
    }

    // Intentar obtener el mensaje de error de la respuesta
    const responseError = error as {
      response?: { data?: { message?: string } };
    };
    if (responseError?.response?.data?.message) {
      return responseError.response.data.message;
    }

    return "Error desconocido al cargar los contratos";
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    console.log("useContracts: Iniciando carga de contratos...");
    console.log("useContracts: Tipo seleccionado:", tipo);
    console.log(
      "useContracts: Electron disponible:",
      typeof window.electron !== "undefined"
    );

    if (typeof window.electron === "undefined") {
      console.error("useContracts: Electron no está disponible");
      setError(
        "Error: La aplicación debe ejecutarse en el entorno de Electron. Por favor, inicie la aplicación desde el ejecutable."
      );
      setLoading(false);
      return;
    }

    // Verificar que la API de contratos esté disponible
    const electron = window.electron as any; // Aserción temporal
    if (!electron.contracts) {
      console.error(
        "useContracts: La API de contratos no está disponible",
        electron
      );
      setError(
        "Error: No se pudo acceder al módulo de contratos. Por favor, intente reiniciar la aplicación."
      );
      setLoading(false);
      return;
    }

    console.log("useContracts: Electron verificado");

    const loadContracts = async () => {
      try {
        console.log("Intentando listar contratos...");
        const electron = window.electron as any; // Aserción temporal

        // Construir los filtros
        const filters: Record<string, any> = {};
        if (tipo) filters.type = tipo;
        if (status) filters.status = status;

        const response = (await electron.contracts.list(
          filters
        )) as ApiResponse<PaginationResponse<Contract>>;

        console.log("useContracts: Respuesta recibida");
        if (!mounted) return;

        console.log("Tipo de respuesta:", typeof response);
        console.log("Respuesta completa:", response);

        if (!response) {
          throw new Error("No se recibió respuesta del servidor");
        }

        // Manejar respuesta de error
        if (!response.success) {
          throw new Error(
            response.error?.message || "Error al cargar los contratos"
          );
        }

        // Extraer los datos de la respuesta
        let contractsData: Contract[] = [];

        // Verificar si la respuesta tiene el formato PaginationResponse
        if (response.data && "items" in response.data) {
          contractsData = response.data.items || [];
        }
        // Si no tiene el formato esperado, intentar extraer los datos de otra manera
        else if (response.data) {
          const data = response.data as any;

          if (Array.isArray(data)) {
            contractsData = data;
          } else if (data.items && Array.isArray(data.items)) {
            contractsData = data.items;
          } else if (typeof data === "object") {
            // Buscar cualquier propiedad que sea un array
            const arrayProp = Object.values(data).find(Array.isArray);
            if (arrayProp) {
              contractsData = arrayProp as Contract[];
            }
          }
        }

        if (contractsData.length > 0) {
          console.log("Contratos cargados:", contractsData);
          setContracts(contractsData);
        } else {
          console.log("No se encontraron contratos");
          setContracts([]);
          setError("No se encontraron contratos");
        }
      } catch (err) {
        console.error("Error al cargar los contratos:", err);
        if (mounted) {
          setError(getErrorMessage(err));
          setContracts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadContracts();

    return () => {
      mounted = false;
    };
  }, [tipo, status]);

  return { contracts, loading, error };
}

// Hook específico para contratos próximos a vencer
export function useExpiringContracts() {
  const { contracts, loading, error } = useContracts({
    status: "Proximo a Vencer",
  });

  return { contracts, loading, error };
}

// Hook específico para contratos vencidos
export function useExpiredContracts() {
  const { contracts, loading, error } = useContracts({
    status: "Vencido",
  });

  return { contracts, loading, error };
}

// Hook específico para contratos activos
export function useActiveContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveContracts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await window.electron.ipcRenderer.invoke(
          "contracts:list",
          { status: "Vigente" }
        );

        if (!response?.success) {
          throw new Error(
            response?.error?.message || "Error al obtener los contratos activos"
          );
        }

        setContracts(response.data || []);
      } catch (err) {
        console.error("Error al cargar los contratos activos:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveContracts();
  }, []);

  return { contracts, loading, error };
}

// Hook específico para todos los contratos
export function useAllContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllContracts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await window.electron.ipcRenderer.invoke(
          "contracts:list",
          {}
        );

        if (!response?.success) {
          throw new Error(
            response?.error?.message || "Error al obtener los contratos"
          );
        }

        setContracts(response.data || []);
      } catch (err) {
        console.error("Error al cargar los contratos:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchAllContracts();
  }, []);

  return { contracts, loading, error };
}

// Hook específico para contratos archivados
export function useArchivedContracts() {
  const [contracts, setContracts] = useState<ArchivedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchivedContracts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await window.electron.ipcRenderer.invoke(
          "contracts:list-archived"
        );

        if (!response?.success) {
          throw new Error(
            response?.error?.message ||
              "Error al obtener los contratos archivados"
          );
        }

        // Asegurarse de que los datos sean un array y tengan el formato correcto
        const data = Array.isArray(response.data) ? response.data : [];
        const archivedContracts: ArchivedContract[] = data.map(
          (contract: any) => ({
            ...contract,
            // Asegurar que los campos requeridos estén presentes
            contractNumber: contract.contractNumber || contract.number || "",
            updatedAt: contract.updatedAt || new Date().toISOString(),
          })
        ) || [];

        setContracts(archivedContracts);
      } catch (err) {
        console.error("Error al cargar contratos archivados:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedContracts();
  }, []);

  return { contracts, loading, error };
}

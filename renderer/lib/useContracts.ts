import { useEffect, useState } from "react";
import { PaginationResponse, ApiResponse } from "../types/electron.d";

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

// Valores del enum ContractStatus definidos en el esquema de Prisma
const CONTRACT_STATUS = {
  ACTIVO: 'ACTIVO',
  VENCIDO: 'VENCIDO'
};

// Hook específico para contratos próximos a vencer
export function useExpiringContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpiringContracts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar el método expuesto en el preload
        const response = await window.electron.statistics.contractsExpiringSoon();

        // Asegurarse de que response.data sea un array
        const data = Array.isArray(response?.data) ? response.data : [];
        
        if (response?.success) {
          setContracts(data);
        } else {
          throw new Error(
            response?.error?.message || 'Error al cargar contratos próximos a vencer'
          );
        }
      } catch (err) {
        console.error('Error al cargar contratos próximos a vencer:', err);
        setError(
          err instanceof Error ? err.message : 'Error al cargar contratos próximos a vencer'
        );
        // Asegurarse de que siempre hay un array vacío en caso de error
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringContracts();
  }, []);

  // Asegurarse de devolver siempre un array
  return { 
    contracts: Array.isArray(contracts) ? contracts : [], 
    loading, 
    error 
  };
}

// Hook específico para contratos vencidos/archivados
export function useExpiredContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpiredContracts = async () => {
      try {
        const electron = window.electron as any;
        const response = await electron.contracts.list({
          status: CONTRACT_STATUS.VENCIDO,
          isArchived: true,
        });

        if (response?.success) {
          setContracts(response.data?.items || []);
        } else {
          throw new Error(
            response?.error?.message || "Error al listar contratos vencidos"
          );
        }
      } catch (err) {
        console.error("Error al cargar los contratos vencidos:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar los contratos vencidos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredContracts();
  }, []);

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
        const electron = window.electron as any;
        const response = await electron.contracts.list({
          status: { in: [CONTRACT_STATUS.ACTIVO, CONTRACT_STATUS.VENCIDO] },
          isArchived: false,
        });

        if (response?.success) {
          setContracts(response.data?.items || []);
        } else {
          throw new Error(
            response?.error?.message || "Error al listar contratos"
          );
        }
      } catch (err) {
        console.error("Error al cargar los contratos activos:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar los contratos"
        );
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

        const electron = window.electron as any;
        const response = await electron.contracts.list({
          isArchived: false,
        });

        if (response?.success) {
          setContracts(response.data?.items || []);
        } else {
          throw new Error(
            response?.error?.message || "Error al listar contratos"
          );
        }
      } catch (err) {
        console.error("Error al cargar los contratos:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar los contratos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllContracts();
  }, []);

  return { contracts, loading, error };
}

// Hook para manejar contratos archivados
export function useArchivedContracts() {
  const [archivedContracts, setArchivedContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchArchivedContracts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const electron = window.electron as any;
      const response = await electron.contracts.list({
        isArchived: true,
        page,
        limit,
      });

      if (response?.success) {
        setArchivedContracts(response.data?.items || []);
        setPagination({
          page: response.data?.meta?.currentPage || 1,
          limit: response.data?.meta?.itemsPerPage || 10,
          total: response.data?.meta?.totalItems || 0,
          totalPages: response.data?.meta?.totalPages || 1,
        });
      } else {
        throw new Error(
          response?.error?.message || "Error al cargar los contratos archivados"
        );
      }
    } catch (err) {
      console.error("Error al cargar los contratos archivados:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar los contratos archivados"
      );
    } finally {
      setLoading(false);
    }
  };

  const restoreContract = async (contractId: string) => {
    try {
      const electron = window.electron as any;
      const response = await electron.contracts.update(contractId, {
        isArchived: false,
      });

      if (response?.success) {
        // Actualizar la lista de contratos archivados
        await fetchArchivedContracts(pagination.page, pagination.limit);
        return { success: true };
      } else {
        throw new Error(
          response?.error?.message || "Error al restaurar el contrato"
        );
      }
    } catch (err) {
      console.error("Error al restaurar el contrato:", err);
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Error al restaurar el contrato",
      };
    }
  };

  useEffect(() => {
    fetchArchivedContracts(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  return {
    archivedContracts,
    loading,
    error,
    pagination,
    fetchArchivedContracts,
    restoreContract,
  };
}

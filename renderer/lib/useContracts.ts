import { useEffect, useState } from "react";
import { ApiResponse, PaginationResponse } from "@/types/electron";

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
  // Inicializar el estado de contratos
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para extraer el mensaje de error de la respuesta
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (!error || typeof error !== 'object') return 'Error desconocido al cargar los contratos';
    
 
    // Manejar error anidado
    const nestedError = error as { error?: { message?: unknown } };
    if (nestedError.error && typeof nestedError.error === 'object') {
      if (nestedError.error.message) {
        return String(nestedError.error.message);
      }
    }
    
    // Intentar obtener el mensaje de error de la respuesta
    const responseError = error as { response?: { data?: { message?: string } } };
    if (responseError?.response?.data?.message) {
      return responseError.response.data.message;
    }
    
    return 'Error desconocido al cargar los contratos';
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    console.log('useContracts: Iniciando carga de contratos...');
    console.log('useContracts: Tipo seleccionado:', tipo);
    console.log('useContracts: Electron disponible:', typeof window.electron !== 'undefined');
    
    if (typeof window.electron === 'undefined') {
      console.error('useContracts: Electron no está disponible');
      setError('Error: La aplicación debe ejecutarse en el entorno de Electron. Por favor, inicie la aplicación desde el ejecutable.');
      setLoading(false);
      return;
    }

    // Verificar que la API de contratos esté disponible
    const electron = window.electron as any; // Aserción temporal
    if (!electron.contracts) {
      console.error('useContracts: La API de contratos no está disponible', electron);
      setError('Error: No se pudo acceder al módulo de contratos. Por favor, intente reiniciar la aplicación.');
      setLoading(false);
      return;
    }

    console.log('useContracts: Electron verificado');

    const loadContracts = async () => {
      try {
        console.log('Intentando listar contratos...');
        const electron = window.electron as any; // Aserción temporal
        const response = await electron.contracts.list(
          tipo ? { type: tipo } : {}
        ) as ApiResponse<PaginationResponse<Contract>>;

        console.log('useContracts: Respuesta recibida');
        if (!mounted) return;
        
        console.log('Tipo de respuesta:', typeof response);
        console.log('Respuesta completa:', response);
        
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        // Manejar respuesta de error
        if (!response.success) {
          throw new Error(
            response.error?.message || 'Error al cargar los contratos'
          );
        }
        
        // Extraer los datos de la respuesta
        let contractsData: Contract[] = [];
        
        // Verificar si la respuesta tiene el formato PaginationResponse
        if (response.data && 'items' in response.data) {
          contractsData = response.data.items || [];
        } 
        // Si no tiene el formato esperado, intentar extraer los datos de otra manera
        else if (response.data) {
          const data = response.data as any;
          
          if (Array.isArray(data)) {
            contractsData = data;
          } else if (data.items && Array.isArray(data.items)) {
            contractsData = data.items;
          } else if (typeof data === 'object') {
            // Buscar cualquier propiedad que sea un array
            const arrayProp = Object.values(data).find(Array.isArray);
            if (arrayProp) {
              contractsData = arrayProp as Contract[];
            }
          }
        }
        
        if (contractsData.length > 0) {
          console.log('Contratos cargados:', contractsData);
          setContracts(contractsData);
        } else {
          console.log('No se encontraron contratos');
          setContracts([]);
          setError('No se encontraron contratos');
        }
        
      } catch (err) {
        console.error('Error al cargar los contratos:', err);
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
  }, [tipo]);

  return { contracts, loading, error };
}

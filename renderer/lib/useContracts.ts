import { useEffect, useState } from "react";
import type { ApiError } from "@/types/electron";

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
    
    // Manejar ApiError
    const apiError = error as ApiError;
    if (apiError.message && typeof apiError.message === 'string') {
      return apiError.message;
    }
    
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
    console.log('useContracts: Electron disponible:', typeof window.Electron !== 'undefined');
    
    if (typeof window.Electron === 'undefined') {
      console.error('useContracts: Electron no está disponible');
      setError('Error: La aplicación no se está ejecutando en un entorno Electron');
      setLoading(false);
      return;
    }

    console.log('useContracts: Electron verificado');

    const loadContracts = async () => {
      try {
        console.log('Intentando listar contratos...');
        const response = await window.Electron.ipcRenderer.invoke(
          "contracts:list", 
          tipo ? { type: tipo } : {}
        );

        console.log('useContracts: Respuesta recibida');
        if (!mounted) return;
        
        console.log('Tipo de respuesta:', typeof response);
        console.log('Respuesta completa:', response);
        
        if (!response || typeof response !== 'object') {
          throw new Error('Respuesta del servidor inválida');
        }
        
        // Manejar respuesta de error
        if ('success' in response && response.success === false) {
          const errorSource = (response as { error?: unknown }).error || response;
          const errorMessage = getErrorMessage(errorSource);
          throw new Error(errorMessage);
        }
        
        // Extraer datos de la respuesta
        let contractsData: Contract[] = [];
        
        if ('data' in response) {
          if (Array.isArray(response.data)) {
            contractsData = response.data;
          } else if (response.data && typeof response.data === 'object') {
            const nestedArray = Object.values(response.data).find(Array.isArray);
            if (nestedArray) contractsData = nestedArray;
          }
        } else if (Array.isArray(response)) {
          contractsData = response;
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

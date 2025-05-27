import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiResponse } from '../types/electron';

interface StatisticsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

type StatisticsType = 
  | 'dashboard'
  | 'contracts'
  | 'contractsByStatus'
  | 'contractsByType'
  | 'contractsByCurrency'
  | 'contractsByUser'
  | 'contractsCreatedByMonth'
  | 'contractsExpiredByMonth'
  | 'supplementsCountByContract';

interface UseStatisticsOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
}

export function useStatistics<T = any>(
  type: StatisticsType,
  filters: Record<string, any> = {},
  options: UseStatisticsOptions = { autoFetch: true, refetchInterval: 0 }
) {
  const [state, setState] = useState<StatisticsState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Limpia el intervalo cuando el componente se desmonta
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, []);

  // Configura el intervalo de refresco si es necesario
  useEffect(() => {
    if (options.refetchInterval && options.refetchInterval > 0) {
      refetchIntervalRef.current = setInterval(() => {
        fetchData();
      }, options.refetchInterval);

      return () => {
        if (refetchIntervalRef.current) {
          clearInterval(refetchIntervalRef.current);
        }
      };
    }
  }, [options.refetchInterval]);

  // Ejecuta el fetch automáticamente si autoFetch es true
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [type, JSON.stringify(filters), options.autoFetch]);

  const fetchData = useCallback(async () => {
    if (!window.electron?.statistics) {
      console.error('Statistics API not available');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response: ApiResponse<T>;
      
      // Ejecuta la función correspondiente según el tipo de estadística
      switch (type) {
        case 'dashboard':
          response = await window.electron.statistics.dashboard();
          break;
        case 'contracts':
          response = await window.electron.statistics.contracts(filters);
          break;
        case 'contractsByStatus':
          response = await window.electron.statistics.contractsByStatus();
          break;
        case 'contractsByType':
          response = await window.electron.statistics.contractsByType();
          break;
        case 'contractsByCurrency':
          response = await window.electron.statistics.contractsByCurrency();
          break;
        case 'contractsByUser':
          response = await window.electron.statistics.contractsByUser();
          break;
        case 'contractsCreatedByMonth':
          response = await window.electron.statistics.contractsCreatedByMonth();
          break;
        case 'contractsExpiredByMonth':
          response = await window.electron.statistics.contractsExpiredByMonth();
          break;
        case 'supplementsCountByContract':
          response = await window.electron.statistics.supplementsCountByContract();
          break;
        default:
          throw new Error(`Tipo de estadística no soportado: ${type}`);
      }

      if (!isMounted.current) return;

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        throw new Error(response.error?.message || 'Error al cargar las estadísticas');
      }
    } catch (error) {
      if (!isMounted.current) return;
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`Error al cargar estadísticas (${type}):`, error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [type, JSON.stringify(filters)]);

  // Función para forzar una actualización manual
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
    // Alias para compatibilidad con código existente
    loading: state.loading,
    error: state.error,
    data: state.data,
  };
}
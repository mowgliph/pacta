import { useEffect, useState, useCallback } from "react";
import type {
  DashboardStats,
  DashboardApiResponse,
  UseDashboardStatsReturn
} from "../types/contracts";
import { dispatchError } from "./error-utils";

// Datos por defecto para el estado inicial
const defaultStats: DashboardStats = {
  totals: {
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    client: 0,
    supplier: 0
  },
  trends: {
    total: { value: 0, label: "vs mes anterior", positive: true },
    active: { value: 0, label: "vs mes anterior", positive: true },
    expiring: { value: 0, label: "próximo mes", positive: false },
    expired: { value: 0, label: "vs mes anterior", positive: false },
  },
  distribution: {
    client: 0,
    supplier: 0,
  },
  recentActivity: [],
  lastUpdated: new Date().toISOString(),
};

// Función auxiliar para calcular el valor de tendencia
const calculateTrendValue = (current: number = 0, previous: number = 0): number => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100 || 0;
};

// Función auxiliar para calcular porcentajes seguros
const calculatePercentage = (part: number = 0, total: number = 0): number => {
  if (!total) return 0;
  return (part / total) * 100 || 0;
};

// Constantes para los mensajes de log
const LOG_PREFIX = '[useDashboardStats]';

const checkElectronEnvironment = () => {
  if (typeof window === 'undefined') {
    throw new Error('Ejecutando en entorno sin ventana (SSR)');
  }
  
  if (typeof window.electron === 'undefined') {
    throw new Error('Objeto window.electron no está definido');
  }
  
  if (typeof window.electron.ipcRenderer === 'undefined') {
    throw new Error('IPC Renderer no está disponible');
  }
  
  return true;
};

export function useDashboardStats(): UseDashboardStatsReturn {
  const [data, setData] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDashboardStats = useCallback(async () => {
    console.log(`${LOG_PREFIX} Iniciando obtención de estadísticas...`);
    
    try {
      setLoading(true);
      setError(null);

      // Verificar entorno de Electron
      checkElectronEnvironment();
      
      console.log(`${LOG_PREFIX} Solicitando estadísticas al backend...`);
      const response = await window.electron.ipcRenderer.invoke(
        "statistics:dashboard"
      );
      
      console.log(`${LOG_PREFIX} Respuesta del backend recibida:`, response);
      
      // Validar la respuesta
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      if (!response.success) {
        throw new Error('Error al obtener las estadísticas');
      }

      if (!response.data?.data) {
        throw new Error('La respuesta no contiene datos');
      }

      const backendData = response.data.data;
      
      // Procesar los datos del backend al formato esperado
      const processedData: DashboardStats = {
        totals: {
          total: backendData.totals?.total ?? 0,
          active: backendData.totals?.active ?? 0,
          expiring: backendData.totals?.expiring ?? 0,
          expired: backendData.totals?.expired ?? 0,
          client: backendData.totals?.client ?? 0,
          supplier: backendData.totals?.supplier ?? 0
        },
        trends: {
          total: backendData.trends?.total || { value: 0, label: "vs mes anterior", positive: true },
          active: backendData.trends?.active || { value: 0, label: "vs mes anterior", positive: true },
          expiring: backendData.trends?.expiring || { value: 0, label: "próximo mes", positive: false },
          expired: backendData.trends?.expired || { value: 0, label: "vs mes anterior", positive: false },
        },
        distribution: {
          client: backendData.distribution?.client ?? 0,
          supplier: backendData.distribution?.supplier ?? 0,
        },
        recentActivity: backendData.recentActivity || [],
        lastUpdated: backendData.lastUpdated || new Date().toISOString(),
      };

      console.log(`${LOG_PREFIX} Datos procesados:`, processedData);
      setData(processedData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener estadísticas';
      console.error(`${LOG_PREFIX} Error:`, errorMessage, err);
      
      // Usar el manejador de errores centralizado con metadatos válidos
      dispatchError('dashboard-stats-error', err instanceof Error ? err : new Error(errorMessage), {
        channel: 'statistics:dashboard',
        originalError: err,
        environment: {
          isElectron: true,
          hasIpc: true,
          online: navigator.onLine
        }
      });
      
      // Mantener los datos por defecto en caso de error
      setError(errorMessage);
      setData(defaultStats);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    console.log('[useDashboardStats] Forzando actualización de datos del dashboard');
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return { 
    data, 
    loading, 
    error, 
    refetch: refreshData 
  };
}

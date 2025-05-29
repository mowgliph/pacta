import { useEffect, useState, useCallback } from "react";
import type {
  DashboardStats,
  UseDashboardStatsReturn,
} from "../types/contracts";

const defaultStats: DashboardStats = {
  totals: {
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    archived: 0,
  },
  trends: {
    total: { value: 0, label: "vs mes anterior", positive: true },
    active: { value: 0, label: "vs mes anterior", positive: true },
    expiring: { value: 0, label: "próximo mes", positive: false },
    expired: { value: 0, label: "este mes", positive: false },
  },
  distribution: {
    client: 0,
    supplier: 0,
  },
  recentActivity: [],
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

export function useDashboardStats(): UseDashboardStatsReturn {
  const [data, setData] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    console.log('[useDashboardStats] Iniciando fetchDashboardStats');
    try {
      setLoading(true);
      setError(null);

      // Verificar si estamos en un entorno de navegador sin Electron
      if (typeof window === 'undefined' || typeof window.electron === "undefined" || !window.electron.ipcRenderer) {
        const errorMsg = 'Electron IPC no está disponible, usando datos por defecto';
        console.warn(errorMsg);
        setData(defaultStats);
        setLoading(false);
        return;
      }

      let response;
      try {
        console.log('[useDashboardStats] Solicitando estadísticas al backend...');
        response = await window.electron.ipcRenderer.invoke(
          "statistics:dashboard"
        );
        console.log('[useDashboardStats] Respuesta del backend recibida');
        console.debug('[useDashboardStats] Respuesta completa:', JSON.stringify(response, null, 2));
        
        // Validar que la respuesta no sea nula o indefinida
        if (response === null || response === undefined) {
          const errorMsg = 'No se recibió respuesta del servidor (respuesta nula o indefinida)';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        // Si hay un error en la respuesta, lanzarlo
        if (response.error) {
          const errorMsg = `Error del servidor: ${response.error.message || 'Error desconocido'}`;
          console.error(errorMsg, response.error);
          throw new Error(errorMsg);
        }
      } catch (error) {
        const ipcError = error as Error;
        const errorMsg = `Error en la comunicación IPC: ${ipcError.message || 'Error desconocido'}`;
        console.error(errorMsg, ipcError);
        throw new Error(`No se pudo conectar con el servidor: ${ipcError.message || 'Error desconocido'}`);
      }

      // Validar la estructura de la respuesta
      if (!response || typeof response !== 'object') {
        const errorMsg = `Respuesta del servidor inválida: ${typeof response}`;
        console.error(errorMsg, response);
        throw new Error('Formato de respuesta inválido del servidor');
      }

      // Verificar si la respuesta tiene éxito
      if (response.success === false) {
        const errorMsg = response.error?.message || 'Error desconocido al cargar las estadísticas';
        console.error('Error en la respuesta del servidor:', errorMsg, response.error);
        throw new Error(errorMsg);
      }

      // Validar la estructura de los datos
      if (!response.data || typeof response.data !== 'object') {
        const errorMsg = 'Datos de estadísticas no válidos o faltantes';
        console.error(errorMsg, response);
        throw new Error(errorMsg);
      }

      // Procesar los datos y calcular las tendencias
      const dashboardData: DashboardStats = {
        totals: {
          total: response.data?.totals?.total ?? 0,
          active: response.data?.totals?.active ?? 0,
          expiring: response.data?.totals?.expiring ?? 0,
          expired: response.data?.totals?.expired ?? 0,
          archived: response.data?.totals?.archived ?? 0,
        },
        trends: {
          total: {
            value: calculateTrendValue(
              response.data?.totals?.total,
              response.data?.lastMonth?.total
            ),
            label: "vs mes anterior",
            positive: (response.data?.totals?.total ?? 0) >= (response.data?.lastMonth?.total ?? 0),
          },
          active: {
            value: calculateTrendValue(
              response.data?.totals?.active,
              response.data?.lastMonth?.active
            ),
            label: "vs mes anterior",
            positive: (response.data?.totals?.active ?? 0) >= (response.data?.lastMonth?.active ?? 0),
          },
          expiring: {
            value: calculatePercentage(
              response.data?.totals?.expiring,
              response.data?.totals?.active
            ),
            label: "próximo mes",
            positive: false,
          },
          expired: {
            value: calculatePercentage(
              response.data?.totals?.expired,
              response.data?.totals?.total
            ),
            label: "este mes",
            positive: false,
          },
        },
        distribution: {
          client: response.data?.distribution?.client ?? 0,
          supplier: response.data?.distribution?.supplier ?? 0,
        },
        recentActivity: Array.isArray(response.data?.recentActivity) 
          ? response.data.recentActivity 
          : [],
      };

      setData(dashboardData);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar las estadísticas"
      );
      // Mantener los datos por defecto en caso de error
      setData(defaultStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return { data, loading, error };
}

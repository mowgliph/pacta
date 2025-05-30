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

      console.log('[useDashboardStats] Solicitando estadísticas al backend...');
      const response = await window.electron.ipcRenderer.invoke(
        "statistics:dashboard"
      );
      
      console.log('[useDashboardStats] Respuesta del backend recibida:', response);
      
      // Si la respuesta tiene éxito, extraer los datos
      if (!response || response.success !== true || !response.data) {
        const errorMsg = response?.error?.message || 'Error desconocido al cargar las estadísticas';
        console.error('Error en la respuesta del servidor:', errorMsg);
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

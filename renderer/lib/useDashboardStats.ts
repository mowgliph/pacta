"use client";
import { useEffect, useState } from "react";
import type { StatisticsDashboard } from "../types/electron.d";

const defaultStats: StatisticsDashboard['data'] = {
  totals: {
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
  },
  distribution: {
    client: 0,
    supplier: 0,
  },
  recentActivity: [],
};

export function useDashboardStats() {
  const [data, setData] = useState<StatisticsDashboard['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar si estamos en un entorno Electron
        if (typeof window.electron === 'undefined' || !window.electron.ipcRenderer) {
          setData(defaultStats);
          setLoading(false);
          return;
        }

        const response = await window.electron.ipcRenderer.invoke("statistics:dashboard");
        if (!mounted) return;

        const statsResponse = response as StatisticsDashboard;
        if (!statsResponse?.success) {
          throw new Error('Error al obtener estadísticas');
        }

        setData(statsResponse.data);
      } catch (err) {
        if (!mounted) return;
        const error = err instanceof Error ? err : new Error('Error desconocido');
        setError(error.message);
        
        // Solo dispatch el evento si hay un error real
        if (err instanceof Error) {
          window.dispatchEvent(new CustomEvent("api-error", {
            detail: {
              error: error.message,
              type: 'statistics-error' as const
            }
          }));
        }
        
        // Si hay error, usar valores por defecto
        setData(defaultStats);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      mounted = false;
    };
  }, []);

  // Si no hay datos, usar valores por defecto
  const statsToShow = data || defaultStats;
  return { data: statsToShow, loading, error };
}

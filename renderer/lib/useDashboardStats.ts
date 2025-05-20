"use client";
import { useEffect, useState } from "react";

interface DashboardStats {
  totals: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
  };
  distribution: {
    client: number;
    supplier: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    contractNumber: string;
    updatedAt: string;
    createdBy: {
      name: string;
    };
  }>;
}

interface ApiResponse {
  success: boolean;
  data: DashboardStats;
}

const defaultStats: DashboardStats = {
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
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchDashboardStats() {
      try {
        setLoading(true);
        setError(null);

        if (!window.Electron?.statistics?.dashboard) {
          throw new Error("API de estadísticas no disponible");
        }

        const response =
          (await window.Electron.statistics.dashboard()) as ApiResponse;

        if (!mounted) return;

        if (!response || !response.success || !response.data) {
          throw new Error("No se recibieron datos válidos");
        }

        // Mezclar los datos recibidos con los valores por defecto
        const stats: DashboardStats = {
          totals: {
            ...defaultStats.totals,
            ...response.data.totals,
          },
          distribution: {
            ...defaultStats.distribution,
            ...response.data.distribution,
          },
          recentActivity: response.data.recentActivity || [],
        };

        setData(stats);
      } catch (err) {
        if (!mounted) return;
        console.error("Error fetching dashboard stats:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar estadísticas"
        );
        // En caso de error, usar valores por defecto
        setData(defaultStats);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardStats();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

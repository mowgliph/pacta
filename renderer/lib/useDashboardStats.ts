"use client";
import { useEffect, useState } from "react";
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

export function useDashboardStats(): UseDashboardStatsReturn {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        if (
          typeof window.electron === "undefined" ||
          !window.electron.ipcRenderer
        ) {
          setData(defaultStats);
          setLoading(false);
          return;
        }

        const response = await window.electron.ipcRenderer.invoke(
          "statistics:dashboard"
        );

        if (!response?.success) {
          throw new Error(
            response?.error?.message || "Error al cargar las estadísticas"
          );
        }

        // Procesar los datos y calcular las tendencias
        const dashboardData: DashboardStats = {
          ...response.data,
          trends: {
            total: {
              value:
                ((response.data.totals.total - response.data.lastMonth.total) /
                  response.data.lastMonth.total) *
                  100 || 0,
              label: "vs mes anterior",
              positive:
                response.data.totals.total >= response.data.lastMonth.total,
            },
            active: {
              value:
                ((response.data.totals.active -
                  response.data.lastMonth.active) /
                  response.data.lastMonth.active) *
                  100 || 0,
              label: "vs mes anterior",
              positive:
                response.data.totals.active >= response.data.lastMonth.active,
            },
            expiring: {
              value:
                (response.data.totals.expiring / response.data.totals.active) *
                  100 || 0,
              label: "próximo mes",
              positive: false,
            },
            expired: {
              value:
                (response.data.totals.expired / response.data.totals.total) *
                  100 || 0,
              label: "este mes",
              positive: false,
            },
          },
        };

        if (mounted) {
          setData(dashboardData);
          setError(null);
        }
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar las estadísticas"
          );
          setData(null);
        }
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

  return { data, loading, error };
}

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

function getDashboardApi() {
  if (
    typeof window !== "undefined" &&
    (window as any).Electron?.statistics?.dashboard
  ) {
    return (window as any).Electron.statistics.dashboard;
  }
  return null;
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const dashboardApi = getDashboardApi();
    if (!dashboardApi) {
      setError("API de estadísticas no disponible");
      setLoading(false);
      return;
    }
    dashboardApi()
      .then((res: any) => {
        if (!mounted) return;
        if (res?.success) {
          setData(res.data);
        } else if (res?.error) {
          setError(res.error.message || "Error al obtener estadísticas");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("api-error"));
          }
        } else {
          setError("Error al obtener estadísticas");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("api-error"));
          }
        }
      })
      .catch((err: any) => {
        if (mounted) {
          setError(err?.message || "Error de conexión");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("api-error"));
          }
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

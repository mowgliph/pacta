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

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    // @ts-ignore
    if (window.Electron?.statistics?.dashboard) {
      // @ts-ignore
      window.Electron.statistics
        .dashboard()
        .then((res: any) => {
          if (!mounted) return;
          if (res?.success) {
            setData(res.data);
          } else if (res?.error) {
            setError(res.error.message || "Error al obtener estadísticas");
          } else {
            setError("Error al obtener estadísticas");
          }
        })
        .catch((err: any) => {
          if (mounted) setError(err?.message || "Error de conexión");
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setError("API de estadísticas no disponible");
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

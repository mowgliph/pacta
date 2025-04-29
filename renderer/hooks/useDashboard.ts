import { useState, useEffect } from "react";
import { StatisticsChannels } from "../../main/channels/statistics.channels";

interface DashboardData {
  byState: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  byType: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  recentActivity: number;
  recentContracts: Array<any>;
  expiringSoon: Array<any>;
  recentActivityList: Array<any>;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await window.Electron.ipcRenderer.invoke(
          StatisticsChannels.GET_BASIC_STATS
        );

        // Transformar los datos para que coincidan con la estructura esperada
        const transformedData: DashboardData = {
          byState: stats.byState || [],
          byType: stats.byType || [],
          totalContracts: stats.totalContracts || 0,
          activeContracts: stats.activeContracts || 0,
          expiringContracts: stats.expiringContracts || 0,
          recentActivity: stats.recentActivity || 0,
          recentContracts: stats.recentContracts || [],
          expiringSoon: stats.expiringSoon || [],
          recentActivityList: stats.recentActivityList || [],
        };

        setData(transformedData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Error al cargar los datos")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Suscribirse a actualizaciones en tiempo real
    const handler = (newData: DashboardData) => {
      setData(newData);
    };

    window.Electron.ipcRenderer.on("dashboard:update", handler);

    return () => {
      window.Electron.ipcRenderer.removeListener("dashboard:update", handler);
    };
  }, []);

  return { data, loading, error };
}

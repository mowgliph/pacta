"use client";
import { useEffect, useState } from "react";

import type { 
  StatisticsContracts, 
  StatisticsByCurrency, 
  StatisticsByUser, 
  StatisticsByMonth, 
  StatisticsSupplements, 
  StatisticsUsersActivity 
} from "../types/electron.d";

export interface Statistics {
  stats: StatisticsContracts['data'];
  byCurrency: StatisticsByCurrency['data'];
  byUser: StatisticsByUser['data'];
  contractsCreated: StatisticsByMonth['data'];
  contractsExpired: StatisticsByMonth['data'];
  supplementsByContract: StatisticsSupplements['data'];
  usersActivity: StatisticsUsersActivity['data'];
}

function getIpcRenderer() {
  return window.Electron?.ipcRenderer;
}

export function useStatistics() {
  const [data, setData] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        const ipc = getIpcRenderer();
        if (!ipc) {
          throw new Error("Estadísticas solo disponibles en entorno Electron");
        }

        const [
          statsRes,
          byCurrencyRes,
          byUserRes,
          contractsCreatedRes,
          contractsExpiredRes,
          supplementsByContractRes,
          usersActivityRes,
        ] = await Promise.all([
          ipc.invoke("statistics:contracts") as Promise<StatisticsContracts>,
          ipc.invoke("statistics:contractsByCurrency") as Promise<StatisticsByCurrency>,
          ipc.invoke("statistics:contractsByUser") as Promise<StatisticsByUser>,
          ipc.invoke("statistics:contractsCreatedByMonth") as Promise<StatisticsByMonth>,
          ipc.invoke("statistics:contractsExpiredByMonth") as Promise<StatisticsByMonth>,
          ipc.invoke("statistics:supplementsCountByContract") as Promise<StatisticsSupplements>,
          ipc.invoke("statistics:usersActivity") as Promise<StatisticsUsersActivity>,
        ]);

        if (!mounted) return;

        setData({
          stats: statsRes.data,
          byCurrency: byCurrencyRes.data,
          byUser: byUserRes.data,
          contractsCreated: contractsCreatedRes.data,
          contractsExpired: contractsExpiredRes.data,
          supplementsByContract: supplementsByContractRes.data,
          usersActivity: usersActivityRes.data,
        });

      } catch (err) {
        if (!mounted) return;
        
        const error = err instanceof Error ? err : new Error("Error al obtener estadísticas");
        setError(error.message);
        
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("api-error", {
            detail: {
              error: error.message,
              type: 'statistics-error' as const
            }
          }));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

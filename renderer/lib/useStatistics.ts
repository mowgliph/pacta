import { useEffect, useState } from "react";

export interface Statistics {
  stats: any;
  byCurrency: any[];
  byUser: any[];
  contractsCreated: any[];
  contractsExpired: any[];
  supplementsByContract: any[];
  usersActivity: any[];
}

export function useStatistics() {
  const [data, setData] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // @ts-ignore
    if (window.Electron?.statistics?.contracts) {
      // @ts-ignore
      Promise.all([
        // @ts-ignore
        window.Electron.statistics.contracts(),
        // @ts-ignore
        window.Electron.statistics.contractsByCurrency(),
        // @ts-ignore
        window.Electron.statistics.contractsByUser(),
        // @ts-ignore
        window.Electron.statistics.contractsCreatedByMonth(),
        // @ts-ignore
        window.Electron.statistics.contractsExpiredByMonth(),
        // @ts-ignore
        window.Electron.statistics.supplementsCountByContract(),
        // @ts-ignore
        window.Electron.statistics.usersActivity(),
      ])
        .then(([
          statsRes,
          byCurrencyRes,
          byUserRes,
          contractsCreatedRes,
          contractsExpiredRes,
          supplementsByContractRes,
          usersActivityRes,
        ]) => {
          setData({
            stats: statsRes,
            byCurrency: byCurrencyRes,
            byUser: byUserRes,
            contractsCreated: contractsCreatedRes,
            contractsExpired: contractsExpiredRes,
            supplementsByContract: supplementsByContractRes,
            usersActivity: usersActivityRes,
          });
        })
        .catch((err: any) => setError(err?.message || "Error de conexión"))
        .finally(() => setLoading(false));
    } else {
      setError("API de estadísticas no disponible");
      setLoading(false);
    }
  }, []);

  return { data, loading, error };
} 
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
    if (window.Electron?.statistics?.contracts) {
      Promise.all([
        window.Electron.statistics.contracts(),
        window.Electron.statistics.contractsByCurrency(),
        window.Electron.statistics.contractsByUser(),
        window.Electron.statistics.contractsCreatedByMonth(),
        window.Electron.statistics.contractsExpiredByMonth(),
        window.Electron.statistics.supplementsCountByContract(),
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
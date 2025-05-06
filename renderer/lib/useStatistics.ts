"use client";
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
        .then(
          ([
            statsRes,
            byCurrencyRes,
            byUserRes,
            contractsCreatedRes,
            contractsExpiredRes,
            supplementsByContractRes,
            usersActivityRes,
          ]) => {
            // Adaptar a nuevo patrón de respuesta
            if (!statsRes?.success)
              return setError(
                statsRes?.error?.message || "Error al obtener estadísticas"
              );
            if (!byCurrencyRes?.success)
              return setError(
                byCurrencyRes?.error?.message || "Error al obtener estadísticas"
              );
            if (!byUserRes?.success)
              return setError(
                byUserRes?.error?.message || "Error al obtener estadísticas"
              );
            if (!contractsCreatedRes?.success)
              return setError(
                contractsCreatedRes?.error?.message ||
                  "Error al obtener estadísticas"
              );
            if (!contractsExpiredRes?.success)
              return setError(
                contractsExpiredRes?.error?.message ||
                  "Error al obtener estadísticas"
              );
            if (!supplementsByContractRes?.success)
              return setError(
                supplementsByContractRes?.error?.message ||
                  "Error al obtener estadísticas"
              );
            if (!usersActivityRes?.success)
              return setError(
                usersActivityRes?.error?.message ||
                  "Error al obtener estadísticas"
              );
            setData({
              stats: statsRes.data,
              byCurrency: byCurrencyRes.data,
              byUser: byUserRes.data,
              contractsCreated: contractsCreatedRes.data,
              contractsExpired: contractsExpiredRes.data,
              supplementsByContract: supplementsByContractRes.data,
              usersActivity: usersActivityRes.data,
            });
          }
        )
        .catch((err: any) => setError(err?.message || "Error de conexión"))
        .finally(() => setLoading(false));
    } else {
      setError("API de estadísticas no disponible");
      setLoading(false);
    }
  }, []);

  return { data, loading, error };
}

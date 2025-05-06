"use client";
import { useEffect, useState } from "react";
import { handleIpcResponse } from "./handleIpcResponse";

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
    Promise.all([
      // @ts-ignore
      window.Electron.ipcRenderer.invoke("statistics:contracts"),
      // @ts-ignore
      window.Electron.ipcRenderer.invoke("statistics:contractsByCurrency"),
      // @ts-ignore
      window.Electron.ipcRenderer.invoke("statistics:contractsByUser"),
      // @ts-ignore
      window.Electron.ipcRenderer.invoke("statistics:contractsCreatedByMonth"),
      // @ts-ignore
      window.Electron.ipcRenderer.invoke("statistics:contractsExpiredByMonth"),
      // @ts-ignore
      window.Electron.ipcRenderer.invoke(
        "statistics:supplementsCountByContract"
      ),
      // @ts-ignore
      window.Electron.ipcRenderer.invoke("statistics:usersActivity"),
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
          try {
            setData({
              stats: handleIpcResponse(statsRes),
              byCurrency: handleIpcResponse(byCurrencyRes),
              byUser: handleIpcResponse(byUserRes),
              contractsCreated: handleIpcResponse(contractsCreatedRes),
              contractsExpired: handleIpcResponse(contractsExpiredRes),
              supplementsByContract: handleIpcResponse(
                supplementsByContractRes
              ),
              usersActivity: handleIpcResponse(usersActivityRes),
            });
          } catch (err: any) {
            setError(err?.message || "Error al obtener estadísticas");
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("api-error"));
            }
          }
        }
      )
      .catch((err: any) => {
        setError(err?.message || "Error de conexión");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("api-error"));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

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

function getIpcRenderer() {
  if (typeof window !== "undefined" && window.Electron?.ipcRenderer) {
    // @ts-ignore
    return window.Electron.ipcRenderer;
  }
  return null;
}

export function useStatistics() {
  const [data, setData] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const ipc = getIpcRenderer();
    if (!ipc) {
      setError("Estadísticas solo disponibles en entorno Electron");
      setLoading(false);
      return;
    }
    Promise.all([
      ipc.invoke("statistics:contracts"),
      ipc.invoke("statistics:contractsByCurrency"),
      ipc.invoke("statistics:contractsByUser"),
      ipc.invoke("statistics:contractsCreatedByMonth"),
      ipc.invoke("statistics:contractsExpiredByMonth"),
      ipc.invoke("statistics:supplementsCountByContract"),
      ipc.invoke("statistics:usersActivity"),
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

"use client";
import { useEffect, useState } from "react";
import { handleIpcResponse } from "./handleIpcResponse";

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    // @ts-ignore
    window.Electron.ipcRenderer
      .invoke("users:list")
      .then((res: any) => {
        if (!mounted) return;
        try {
          setUsers(handleIpcResponse<User[]>(res));
        } catch (err: any) {
          setError(err?.message || "Error al obtener usuarios");
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

  return { users, loading, error };
}

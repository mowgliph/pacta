"use client";
import { useEffect, useState } from "react";
import type { User, UserResponse, IpcRenderer } from "../types/electron.d";

export function getIpcRenderer(): IpcRenderer | null {
  if (typeof window !== "undefined" && window.Electron?.ipcRenderer) {
    return window.Electron.ipcRenderer;
  }
  return null;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const fetchUsers = async () => {
      const ipc = getIpcRenderer();
      if (!ipc) {
        throw new Error("API de usuarios no disponible");
      }

      try {
        const response = await ipc.invoke("users:list") as UserResponse;
        if (!mounted) return;
        setUsers(response.data);
      } catch (err) {
        if (!mounted) return;
        
        const error = err instanceof Error ? err : new Error("Error al obtener usuarios");
        setError(error.message);
        
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("api-error", {
            detail: {
              error: error.message,
              type: 'users-error' as const
            }
          }));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);

  return { users, loading, error };
}

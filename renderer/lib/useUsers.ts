"use client";
import { useEffect, useState } from "react";

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
    if (window.Electron?.users?.list) {
      // @ts-ignore
      window.Electron.users
        .list()
        .then((res: any) => {
          if (!mounted) return;
          if (res.success && Array.isArray(res.data)) {
            setUsers(res.data);
          } else if (res?.error) {
            setError(res.error.message || "Error al obtener usuarios");
          } else {
            setError("Error al obtener usuarios");
          }
        })
        .catch((err: any) => {
          if (mounted) setError(err?.message || "Error de conexión");
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setError("API de usuarios no disponible");
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, []);

  return { users, loading, error };
}

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { ApiResponse, IpcRenderer, User } from "../types/electron.d";

export function getIpcRenderer(): IpcRenderer | null {
  if (typeof window !== "undefined" && window.electron?.ipcRenderer) {
    return window.electron.ipcRenderer;
  }
  return null;
}

export function useUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const mounted = useRef(true);
  const apiResponse = useRef<ApiResponse<{ users: User[]; total: number }> | null>(null);

  const cleanup = () => {
    mounted.current = false;
  };

  useEffect(() => {
    return cleanup;
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchUsers = async () => {
      const ipc = getIpcRenderer();
      if (!ipc) {
        throw new Error("API de usuarios no disponible");
      }

      try {
        const rawResponse = await ipc.invoke("users:list");
        if (!mounted.current) return;
        
        console.log("Respuesta raw:", rawResponse);
        
        // Primero verificamos si la respuesta es exitosa
        if (!rawResponse?.success) {
          const errorMessage = rawResponse?.error?.message || "Error al obtener usuarios";
          const errorDetails = rawResponse?.error?.context || {};
          throw new Error(errorMessage, {
            cause: {
              code: rawResponse?.error?.code || "UNKNOWN_ERROR",
              context: errorDetails
            }
          });
        }

        // Si es exitosa, verificamos la estructura de datos
        const typedResponse = rawResponse as ApiResponse<{ users: User[]; total: number }>;
        console.log("Respuesta tipada:", typedResponse);

        // Asegurarnos de que data es un objeto válido
        const data = typedResponse.data || { users: [], total: 0 };
        
        // Verificar si los datos son válidos
        if (!data.users) {
          throw new Error("Formato de datos incorrecto: users es undefined o null");
        }

        // Verificar que es un array antes de usar entries()
        if (!Array.isArray(data.users)) {
          throw new Error("Formato de datos incorrecto: users no es un array");
        }

        // Verificar que cada usuario tiene las propiedades requeridas
        for (const user of data.users) {
          if (!user.id || !user.name || !user.email) {
            throw new Error("Datos de usuario incompletos");
          }
        }

        // Si todo está bien, almacenamos la respuesta
        apiResponse.current = {
          success: true,
          data
        };
        setUsers(data.users);
        setTotal(data.total || data.users.length);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : "Error al obtener usuarios";
        const errorCode = err instanceof Error ? err.message : "UNKNOWN_ERROR";
        const errorContext = {
          responseStructure: apiResponse.current ? {
            type: typeof apiResponse.current,
            hasData: apiResponse.current?.data !== undefined,
            hasUsers: apiResponse.current?.data?.users !== undefined,
            usersType: apiResponse.current?.data?.users ? typeof apiResponse.current.data.users : 'undefined'
          } : 'no response'
        };
          
        setError(errorMessage);
        
        // Dispatch del evento de error
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("api-error", {
            detail: {
              error: errorMessage,
              type: 'users-error',
              metadata: {
                channel: 'users:list',
                timestamp: new Date().toISOString(),
                response: {
                  success: apiResponse.current?.success ?? false,
                  hasData: !!apiResponse.current?.data,
                  hasUsers: !!apiResponse.current?.data?.users,
                  usersCount: apiResponse.current?.data?.users?.length ?? 0,
                  dataStructure: {
                    isObject: apiResponse.current?.data !== undefined && typeof apiResponse.current.data === 'object',
                    hasUsers: apiResponse.current?.data !== undefined && 'users' in apiResponse.current.data,
                    hasTotal: apiResponse.current?.data !== undefined && 'total' in apiResponse.current.data,
                    usersType: apiResponse.current?.data?.users !== undefined ? typeof apiResponse.current.data.users : 'undefined'
                  }
                },
                errorDetails: {
                  message: errorMessage,
                  code: errorCode,
                  context: errorContext
                }
              }
            }
          }));
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      mounted.current = false;
    };
  }, []);

  return { users, loading, error };
}

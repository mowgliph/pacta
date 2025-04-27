import { useState, useEffect } from 'react';

/**
 * Hook para invocar métodos IPC asíncronos (con promesas) en el proceso principal.
 * 
 * @param channel - El canal IPC a invocar
 * @param initialPayload - Datos iniciales para enviar (opcional)
 * @returns Un objeto con los datos, error, estado de carga y función para invocar el canal
 */
export function useIPCInvoke<TPayload = any, TResponse = any>(
  channel: string,
  initialPayload?: TPayload
) {
  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const invoke = async (payload?: TPayload): Promise<TResponse> => {
    setIsLoading(true);
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      const result = await window.Electron.ipcRenderer.invoke(channel, payload || initialPayload);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, error, isLoading, invoke };
}

/**
 * Hook para escuchar eventos IPC desde el proceso principal.
 * 
 * @param channel - El canal IPC a escuchar
 * @returns Los datos más recientes recibidos del canal
 */
export function useIPCOn<T = any>(channel: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    // Función para manejar los mensajes recibidos
    const handler = (data: T) => {
      setData(data);
    };
    
    // Suscribirse al evento
    // @ts-ignore - Electron está expuesto por el preload script
    window.Electron.receive?.(channel, handler);
    
    // Limpiar al desmontar
    return () => {
      // Si existe un método para eliminar listeners, usarlo aquí
      // window.Electron.removeListener?.(channel, handler);
    };
  }, [channel]);

  return data;
}

/**
 * Hook para invocar un método IPC al cargar el componente.
 * 
 * @param channel - El canal IPC a invocar
 * @param payload - Datos para enviar
 * @param dependencies - Array de dependencias que dispararán una nueva invocación
 * @returns Un objeto con los datos, error y estado de carga
 */
export function useIPCEffect<TPayload = any, TResponse = any>(
  channel: string,
  payload?: TPayload,
  dependencies: any[] = []
) {
  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        // @ts-ignore - Electron está expuesto por el preload script
        const result = await window.Electron.ipcRenderer.invoke(channel, payload);
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, ...dependencies]);

  return { data, error, isLoading };
} 
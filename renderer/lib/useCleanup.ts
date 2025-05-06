import { useEffect } from "react";

/**
 * Hook para ejecutar funciones de limpieza al desmontar el componente.
 * @param cleanupFn Función de limpieza (cerrar listeners, limpiar buffers, etc.)
 */
export const useCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    return () => {
      cleanupFn();
    };
  }, []);
};

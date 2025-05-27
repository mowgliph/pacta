
import { useCallback } from "react";
import type { FileDialogOptions } from "../types/electron.d";

/**
 * Hook para usar diálogos de archivos de Electron
 * @returns Objeto con funciones para abrir y guardar archivos
 */
export const useFileDialog = () => {
  /**
   * Abre un diálogo para seleccionar un archivo
   * @param options - Opciones de configuración para el diálogo
   * @returns Resultado del diálogo o null si se canceló o no está disponible
   */
  const openFile = useCallback(async (options: FileDialogOptions = {}) => {
    try {
      if (!window.Electron?.files?.open) {
        throw new Error('API de diálogo de archivos no disponible');
      }
      const result = await window.Electron.files.open(options);
      if (!result) return null;
      return result;
    } catch (err) {
      console.error('Error al abrir archivo:', err);
      window.dispatchEvent(new CustomEvent("api-error", {
        detail: {
          error: err instanceof Error ? err.message : 'Error desconocido',
          type: 'file-dialog-error' as const
        }
      }));
      return null;
    }
  }, []);

  const saveFile = useCallback(async (options: FileDialogOptions = {}) => {
    try {
      if (!window.Electron?.files?.save) {
        throw new Error('API de diálogo de archivos no disponible');
      }
      const result = await window.Electron.files.save(options);
      if (!result) return null;
      return result;
    } catch (err) {
      console.error('Error al guardar archivo:', err);
      window.dispatchEvent(new CustomEvent("api-error", {
        detail: {
          error: err instanceof Error ? err.message : 'Error desconocido',
          type: 'file-dialog-error' as const
        }
      }));
      return null;
    }
  }, []);

  return { openFile, saveFile };
};

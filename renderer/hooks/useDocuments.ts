"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

// Definir los canales en el renderer en lugar de importarlos directamente desde main
export enum DocumentsChannels {
  OPEN = "documents:open",
  SAVE = "documents:save",
  GET_ALL = "documents:getAll",
  GET_BY_ID = "documents:getById",
  UPDATE = "documents:update",
  DELETE = "documents:delete",
  DOWNLOAD = "documents:download",
}

interface DocumentMetadata {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  description?: string;
  contractId?: string;
  supplementId?: string;
  isPublic?: boolean;
  tags?: string[];
}

/**
 * Hook para gestionar operaciones con documentos a través de IPC
 */
export const useDocuments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = useCallback(async (file: File, metadata: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.Electron.documentos.guardar(file.name, file);

      if (result) {
        toast.success("Documento guardado exitosamente");
        return result;
      } else {
        throw new Error("Error al guardar el documento");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error(`Error al guardar el documento: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openDocument = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.Electron.documentos.abrir(path);

      if (!result) {
        throw new Error("No se pudo abrir el documento");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error(`Error al abrir el documento: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listDocuments = useCallback(async (contractId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const documents = await window.Electron.documentos.listar(contractId);
      return documents;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error(`Error al listar documentos: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtiene los documentos de un suplemento
   * @param supplementId - ID del suplemento
   */
  const getSupplementDocuments = async (supplementId: string) => {
    if (!supplementId) return [];

    setIsLoading(true);
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      return await window.Electron.ipcRenderer.invoke(
        "documents:getBySupplement",
        supplementId
      );
    } catch (error) {
      console.error(
        `Error al obtener documentos del suplemento ${supplementId}:`,
        error
      );
      toast.error("No se pudieron cargar los documentos del suplemento");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Elimina un documento
   * @param documentId - ID del documento a eliminar
   */
  const deleteDocument = async (documentId: string) => {
    if (!documentId) return false;

    setIsLoading(true);
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      const result = await window.Electron.ipcRenderer.invoke(
        DocumentsChannels.DELETE,
        documentId
      );

      if (result && result.success) {
        toast.success("Documento eliminado correctamente");
        return true;
      } else {
        toast.error(result?.message || "No se pudo eliminar el documento");
        return false;
      }
    } catch (error) {
      console.error(`Error al eliminar documento ${documentId}:`, error);
      toast.error("Ocurrió un error al eliminar el documento");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Descarga un documento
   * @param documentId - ID del documento a descargar
   */
  const downloadDocument = async (documentId: string) => {
    if (!documentId) return null;

    setIsLoading(true);
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      const fileData = await window.Electron.ipcRenderer.invoke(
        DocumentsChannels.DOWNLOAD,
        documentId
      );

      if (fileData) {
        // El manejo del archivo descargado depende de la implementación
        // Podría ser automáticamente descargado por Electron o devuelto para su procesamiento
        return fileData;
      } else {
        toast.error("No se pudo descargar el documento");
        return null;
      }
    } catch (error) {
      console.error(`Error al descargar documento ${documentId}:`, error);
      toast.error("Ocurrió un error al descargar el documento");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadDocument,
    openDocument,
    listDocuments,
    isLoading,
    error,
    getSupplementDocuments,
    deleteDocument,
    downloadDocument,
  };
};

"use client"

import { useState } from "react"
import { DocumentsChannels } from "../../main/ipc/channels/documents.channels"
import { useToast } from "./use-toast"

interface DocumentMetadata {
  fileName: string
  originalName: string
  mimeType: string
  size: number
  description?: string
  contractId?: string
  supplementId?: string
  isPublic?: boolean
  tags?: string[]
}

/**
 * Hook para gestionar operaciones con documentos a través de IPC
 */
export function useDocuments() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  /**
   * Sube un documento al servidor a través de IPC
   * @param file - Archivo a subir
   * @param metadata - Metadatos del documento
   * @returns Promise con el resultado de la operación
   */
  const uploadDocument = async (file: File, metadata: Omit<DocumentMetadata, "fileName" | "originalName" | "mimeType" | "size">) => {
    if (!file) {
      toast({
        title: "Error",
        description: "Debe seleccionar un archivo",
        variant: "destructive",
      })
      return null
    }

    setIsLoading(true)

    try {
      // Convertir el archivo a un ArrayBuffer para enviarlo por IPC
      const arrayBuffer = await file.arrayBuffer()
      
      // Preparar metadata completa del documento
      const completeMetadata: DocumentMetadata = {
        fileName: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        ...metadata
      }
      
      // Enviar al proceso principal via IPC
      // @ts-ignore - Electron está expuesto por el preload script
      const result = await window.Electron.ipcRenderer.invoke(
        DocumentsChannels.SAVE, 
        { buffer: Buffer.from(arrayBuffer) }, 
        completeMetadata,
        // El ID del usuario se debe pasar desde el contexto de autenticación
        undefined
      )

      if (result) {
        toast({
          title: "Éxito",
          description: "Documento subido correctamente",
        })
      }
      
      return result
    } catch (error) {
      console.error("Error al subir documento:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al subir el documento",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Obtiene los documentos de un contrato
   * @param contractId - ID del contrato
   */
  const getContractDocuments = async (contractId: string) => {
    if (!contractId) return []
    
    setIsLoading(true)
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      return await window.Electron.ipcRenderer.invoke("documents:getByContract", contractId)
    } catch (error) {
      console.error(`Error al obtener documentos del contrato ${contractId}:`, error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos del contrato",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Obtiene los documentos de un suplemento
   * @param supplementId - ID del suplemento
   */
  const getSupplementDocuments = async (supplementId: string) => {
    if (!supplementId) return []
    
    setIsLoading(true)
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      return await window.Electron.ipcRenderer.invoke("documents:getBySupplement", supplementId)
    } catch (error) {
      console.error(`Error al obtener documentos del suplemento ${supplementId}:`, error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos del suplemento",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Elimina un documento
   * @param documentId - ID del documento a eliminar
   */
  const deleteDocument = async (documentId: string) => {
    if (!documentId) return false

    setIsLoading(true)
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      const result = await window.Electron.ipcRenderer.invoke(DocumentsChannels.DELETE, documentId)
      
      if (result && result.success) {
        toast({
          title: "Éxito",
          description: "Documento eliminado correctamente",
        })
        return true
      } else {
        toast({
          title: "Error",
          description: result?.message || "No se pudo eliminar el documento",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error(`Error al eliminar documento ${documentId}:`, error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el documento",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Descarga un documento
   * @param documentId - ID del documento a descargar
   */
  const downloadDocument = async (documentId: string) => {
    if (!documentId) return null

    setIsLoading(true)
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      const fileData = await window.Electron.ipcRenderer.invoke(DocumentsChannels.DOWNLOAD, documentId)
      
      if (fileData) {
        // El manejo del archivo descargado depende de la implementación
        // Podría ser automáticamente descargado por Electron o devuelto para su procesamiento
        return fileData
      } else {
        toast({
          title: "Error",
          description: "No se pudo descargar el documento",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error(`Error al descargar documento ${documentId}:`, error)
      toast({
        title: "Error",
        description: "Ocurrió un error al descargar el documento",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    uploadDocument,
    getContractDocuments,
    getSupplementDocuments,
    deleteDocument,
    downloadDocument,
  }
}

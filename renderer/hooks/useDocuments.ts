"use client"

import { useState, useCallback } from "react"
import { useToast } from "../components/ui/use-toast"

export function useDocuments(contractId: string, supplementId?: string) {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = supplementId ? `/api/supplements/${supplementId}/documents` : `/api/contracts/${contractId}/documents`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Error fetching documents")
      }
      const data = await response.json()
      setDocuments(data.documents)
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [contractId, supplementId, toast])

  const uploadDocument = useCallback(
    async (file: File, description?: string) => {
      try {
        const formData = new FormData()
        formData.append("file", file)

        if (description) {
          formData.append("description", description)
        }

        if (supplementId) {
          formData.append("supplementId", supplementId)
        } else {
          formData.append("contractId", contractId)
        }

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Error uploading document")
        }

        const result = await response.json()
        return result.document
      } catch (error) {
        console.error("Error uploading document:", error)
        toast({
          title: "Error",
          description: "No se pudo subir el documento",
          variant: "destructive",
        })
        return null
      }
    },
    [contractId, supplementId, toast],
  )

  const deleteDocument = useCallback(
    async (documentId: string) => {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Error deleting document")
        }

        // Actualizar la lista de documentos
        setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== documentId))

        return true
      } catch (error) {
        console.error("Error deleting document:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el documento",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  return {
    documents,
    isLoading,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
  }
}

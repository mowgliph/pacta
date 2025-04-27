"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { LoadingSpinner } from "../ui/loading-spinner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FileText, Download, Upload, Trash2 } from "lucide-react"
import { useDocuments } from "../../hooks/useDocuments"
import { FileUploadDialog } from "./FileUploadDialog"
import { useToast } from "../ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"

interface DocumentListProps {
  contractId: string
}

export function DocumentList({ contractId }: DocumentListProps) {
  const { documents, isLoading, fetchDocuments, deleteDocument } = useDocuments(contractId)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />
    } else if (mimeType.includes("word") || mimeType.includes("doc")) {
      return <FileText className="h-8 w-8 text-blue-500" />
    } else if (mimeType.includes("excel") || mimeType.includes("sheet")) {
      return <FileText className="h-8 w-8 text-green-500" />
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return

    setIsDeleting(true)
    try {
      await deleteDocument(selectedDocument.id)
      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente",
      })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documentos del Contrato</CardTitle>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Documento
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay documentos asociados a este contrato</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-md p-4 flex items-start">
                  <div className="mr-4 flex-shrink-0">{getFileIcon(document.mimeType)}</div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium truncate" title={document.originalName}>
                      {document.originalName}
                    </h4>
                    <p className="text-sm text-gray-500">{formatFileSize(document.size)}</p>
                    <p className="text-xs text-gray-500">Subido el {formatDate(document.uploadedAt)}</p>
                    <div className="flex mt-2 space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/documents/${document.id}/download`} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3 mr-1" />
                          Descargar
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(document)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        contractId={contractId}
        onSuccess={() => {
          setIsUploadDialogOpen(false)
          fetchDocuments()
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Documento</DialogTitle>
          </DialogHeader>
          <p>
            ¿Está seguro de que desea eliminar el documento "{selectedDocument?.originalName}"? Esta acción no se puede
            deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

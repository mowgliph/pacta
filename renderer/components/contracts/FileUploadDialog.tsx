"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Spinner } from "../ui/spinner"
import { FileUpload } from "../ui/file-upload"
import { useToast } from "../../hooks/use-toast"
import { useDocuments } from "../../hooks/useDocuments"

interface FileUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  contractId: string
  supplementId?: string
  onSuccess?: () => void
}

export function FileUploadDialog({ isOpen, onClose, contractId, supplementId, onSuccess }: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const { uploadDocument, isLoading } = useDocuments()
  const { toast } = useToast()

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Debe seleccionar un archivo",
        variant: "destructive",
      })
      return
    }

    const result = await uploadDocument(file, {
      description,
      contractId,
      supplementId,
      isPublic: false,
      tags: []
    })

    if (result) {
      onSuccess?.()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir Documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FileUpload
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            maxSize={20 * 1024 * 1024} // 20MB
            onFileSelected={setFile}
            label="Documento"
            description="Sube un documento (PDF, Word, Excel, PowerPoint, máx. 20MB)"
          />

          {file && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describa el contenido del documento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={isLoading || !file}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" size="sm" />
                Subiendo...
              </>
            ) : (
              "Subir Documento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

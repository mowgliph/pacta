import React, { useState } from 'react'
import { 
  IconFileUpload, 
  IconFile, 
  IconTrash, 
  IconFileCheck 
} from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ContractFileUploadProps {
  onChange: (file: File | null) => void
  accept?: string
  label?: string
}

/**
 * Componente para subir archivos de contrato
 */
export const ContractFileUpload: React.FC<ContractFileUploadProps> = ({
  onChange,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  label = 'Documento del contrato'
}) => {
  const [file, setFile] = useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      onChange(selectedFile)
    }
  }
  
  // Manejar eliminación de archivo
  const handleRemoveFile = () => {
    setFile(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }
  
  // Manejar click en el dropzone
  const handleDropzoneClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }
  
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      
      {!file ? (
        <div 
          onClick={handleDropzoneClick}
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Input 
            type="file" 
            ref={inputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <IconFileUpload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Haga clic para seleccionar un archivo o arrástrelo aquí
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Formatos soportados: PDF, DOC, DOCX, JPG, PNG
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary/10 p-2">
                <IconFileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 
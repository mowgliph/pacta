import React, { useState } from 'react'
import { useNavigate } from '@remix-run/react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotifications } from '@/hooks/useNotifications'
import { IconArrowLeft } from '@tabler/icons-react'
import { useContract, useCreateSupplement } from '../hooks/useContracts'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SupplementCreatePageProps {
  contractId: string
}

/**
 * Página para crear un nuevo suplemento para un contrato
 */
export function SupplementCreatePage({ contractId }: SupplementCreatePageProps) {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotifications()
  
  // Cargar datos del contrato relacionado
  const { data: contract, isLoading, error } = useContract(contractId)
  
  // Estados para el formulario
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  // Hook para crear suplemento
  const { execute: createSupplement, isLoading: isSubmitting } = useCreateSupplement(contractId)
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos
    if (!name || !effectiveDate) {
      showError('Error en el formulario', 'Por favor complete todos los campos obligatorios')
      return
    }
    
    try {
      // Preparar los datos
      const formData = new FormData()
      const supplementData = {
        name,
        description,
        effectiveDate,
        contractId
      }
      
      formData.append('data', JSON.stringify(supplementData))
      
      // Añadir el archivo si existe
      if (file) {
        formData.append('document', file)
      }
      
      // Crear suplemento
      await createSupplement(formData)
      
      showSuccess('Suplemento creado', 'El suplemento se ha creado correctamente')
      navigate(`/contracts/${contractId}`)
    } catch (error) {
      console.error('Error al crear suplemento:', error)
      showError(
        'Error al crear suplemento', 
        'No se pudo crear el suplemento. Por favor, inténtelo de nuevo.'
      )
    }
  }
  
  // Función para volver a los detalles del contrato
  const handleCancel = () => {
    navigate(`/contracts/${contractId}`)
  }
  
  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  // Mostrar carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cargando contrato..."
          backButton={true}
          backPath={`/contracts/${contractId}`}
        />
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Mostrar error
  if (error || !contract) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Error al cargar contrato"
          backButton={true}
          backPath="/contracts"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">No se pudo cargar la información del contrato</p>
            <Button onClick={() => navigate('/contracts')}>Volver a la lista</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Crear nuevo suplemento"
        description={`Para: ${contract.name} (${contract.contractNumber})`}
        backButton={true}
        backPath={`/contracts/${contractId}`}
        actions={
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="gap-2"
          >
            <IconArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        }
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Información del suplemento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del suplemento *</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Modificación de plazos"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Fecha de vigencia *</Label>
                <Input 
                  id="effectiveDate"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describa el propósito de este suplemento"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">Documento adjunto</Label>
              <Input 
                id="document"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
              <p className="text-sm text-muted-foreground">
                Formatos aceptados: PDF, Word, Excel (máx. 10MB)
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !name || !effectiveDate}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar suplemento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
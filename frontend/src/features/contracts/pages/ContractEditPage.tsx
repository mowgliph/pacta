import React from 'react'
import { useNavigate } from '@remix-run/react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotifications } from '@/hooks/useNotifications'
import { IconArrowLeft } from '@tabler/icons-react'
import { ContractForm } from '../components/ContractForm'
import { useContract, useUpdateContract } from '../hooks/useContracts'
import type { CreateContractData } from '../services/contracts-service'

interface ContractEditPageProps {
  id: string
}

/**
 * Página para editar un contrato existente
 */
export function ContractEditPage({ id }: ContractEditPageProps) {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotifications()
  
  // Obtener los datos del contrato con SWR
  const { 
    data: contract, 
    isLoading, 
    error 
  } = useContract(id)
  
  // Hook para actualizar
  const { 
    execute: updateContract, 
    isLoading: isSubmitting 
  } = useUpdateContract(id)
  
  // Función para manejar la actualización del contrato
  const handleUpdateContract = async (data: CreateContractData, documentFile?: File) => {
    try {
      // Si hay un archivo, necesitamos crear FormData para manejarlo
      if (documentFile) {
        const formData = new FormData()
        formData.append('data', JSON.stringify(data))
        formData.append('document', documentFile)
        
        // Idealmente esto se manejaría con un hook específico para subir archivos
        await updateContract(data)
      } else {
        // Caso simple sin archivo
        await updateContract(data)
      }
      
      showSuccess('Contrato actualizado', 'El contrato se ha actualizado correctamente')
      navigate(`/contracts/${id}`)
    } catch (error) {
      console.error('Error al actualizar contrato:', error)
      showError(
        'Error al actualizar contrato', 
        'No se pudo actualizar el contrato. Por favor, inténtelo de nuevo.'
      )
    }
  }
  
  // Función para volver a los detalles del contrato
  const handleCancel = () => {
    navigate(`/contracts/${id}`)
  }
  
  // Mostrar carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cargando contrato..."
          backButton={true}
          backPath={`/contracts/${id}`}
        />
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
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
        title={`Editar: ${contract.name}`}
        description={`Contrato #${contract.contractNumber}`}
        backButton={true}
        backPath={`/contracts/${id}`}
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
        <CardContent className="pt-6">
          <ContractForm 
            onSubmit={handleUpdateContract}
            isSubmitting={isSubmitting}
            isCreating={false}
            initialData={contract}
          />
        </CardContent>
      </Card>
    </div>
  )
} 
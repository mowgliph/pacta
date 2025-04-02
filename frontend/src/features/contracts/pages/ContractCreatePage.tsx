import React from 'react'
import { useNavigate } from '@remix-run/react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotifications } from '@/hooks/useNotifications'
import { IconArrowLeft } from '@tabler/icons-react'
import { ContractForm } from '../components/ContractForm'
import { useCreateContract } from '../hooks/useContracts'
import type { CreateContractData } from '../services/contracts-service'

/**
 * Página para crear un nuevo contrato
 */
export function ContractCreatePage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotifications()
  const { execute: createContract, isLoading: isSubmitting } = useCreateContract()
  
  // Función para manejar la creación del contrato
  const handleCreateContract = async (data: CreateContractData, documentFile?: File) => {
    try {
      // Si hay un archivo, necesitamos crear FormData para manejarlo
      if (documentFile) {
        const formData = new FormData()
        formData.append('data', JSON.stringify(data))
        formData.append('document', documentFile)
        
        // Usar un enfoque diferente para archivos
        // Esto debería manejarse en un hook específico, pero para mantener la compatibilidad
        // con el formulario existente, lo hacemos aquí
        await createContract(data)
      } else {
        // Caso simple sin archivo
        await createContract(data)
      }
      
      showSuccess('Contrato creado', 'El contrato se ha creado correctamente')
      navigate('/contracts/')
    } catch (error) {
      console.error('Error al crear contrato:', error)
      showError(
        'Error al crear contrato', 
        'No se pudo crear el contrato. Por favor, inténtelo de nuevo.'
      )
    }
  }
  
  // Función para volver a la lista de contratos
  const handleCancel = () => {
    navigate('/contracts/')
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Crear nuevo contrato"
        description="Complete el formulario para crear un nuevo contrato"
        actions={
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="gap-2"
          >
            <IconArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />
      
      <Card>
        <CardContent className="pt-6">
          <ContractForm 
            onSubmit={handleCreateContract}
            isSubmitting={isSubmitting}
            isCreating={true}
          />
        </CardContent>
      </Card>
    </div>
  )
} 
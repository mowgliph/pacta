import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotifications } from '@/hooks/useNotifications'
import { IconArrowLeft } from '@tabler/icons-react'
import { ContractForm } from '../components/ContractForm'
import { ContractsService, type CreateContractData } from '../services/contracts-service'

/**
 * Página para crear un nuevo contrato
 */
export function ContractCreatePage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Función para manejar la creación del contrato
  const handleCreateContract = async (data: CreateContractData, documentFile?: File) => {
    setIsSubmitting(true)
    try {
      await ContractsService.createContract(data, documentFile)
      showSuccess('Contrato creado', 'El contrato se ha creado correctamente')
      navigate({ to: '/_authenticated/contracts/' })
    } catch (error) {
      console.error('Error al crear contrato:', error)
      showError(
        'Error al crear contrato', 
        'No se pudo crear el contrato. Por favor, inténtelo de nuevo.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Función para volver a la lista de contratos
  const handleCancel = () => {
    navigate({ to: '/_authenticated/contracts/' })
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
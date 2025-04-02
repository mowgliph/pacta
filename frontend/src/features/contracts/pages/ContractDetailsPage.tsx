import React from 'react'
import { useNavigate } from '@remix-run/react'
import { useContract, useContractAttachments, useContractSupplements } from '../hooks/useContracts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconArrowLeft, IconEdit, IconTrash, IconFileText } from '@tabler/icons-react'

interface ContractDetailsPageProps {
  id: string
}

export function ContractDetailsPage({ id }: ContractDetailsPageProps) {
  const navigate = useNavigate()
  
  // Usar los hooks SWR para obtener los datos del contrato y relacionados
  const { 
    data: contract, 
    isLoading: isLoadingContract, 
    error: contractError,
    mutate: refreshContract
  } = useContract(id)
  
  // Cargar adjuntos
  const {
    data: attachments,
    isLoading: isLoadingAttachments,
    error: attachmentsError
  } = useContractAttachments(id)
  
  // Cargar suplementos
  const {
    data: supplements,
    isLoading: isLoadingSupplements,
    error: supplementsError
  } = useContractSupplements(id)
  
  // Manejar navegación a la lista de contratos
  const handleBack = () => {
    navigate('/contracts')
  }
  
  // Manejar navegación a la edición del contrato
  const handleEdit = () => {
    navigate(`/contracts/${id}/edit`)
  }
  
  // Si está cargando, mostrar un esqueleto
  if (isLoadingContract) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cargando detalles..."
          backButton={true}
          backPath="/contracts"
        />
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Si hay error, mostrar mensaje
  if (contractError) {
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
            <Button onClick={() => refreshContract()}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Si no hay contrato, mostrar mensaje
  if (!contract) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contrato no encontrado"
          backButton={true}
          backPath="/contracts"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">El contrato solicitado no existe o ha sido eliminado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={contract.name}
        description={`Contrato #${contract.contractNumber}`}
        backButton={true}
        backPath="/contracts"
        actions={
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="gap-2"
            >
              <IconEdit className="h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />
      
      {/* Aquí irán más componentes de detalle que se implementarán en pasos posteriores */}
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Número de contrato</h3>
            <p>{contract.contractNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
            <p>{contract.type === 'client' ? 'Cliente' : 'Proveedor'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Empresa</h3>
            <p>{contract.companyName || 'No especificada'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
            <p>{
              contract.status === 'active' ? 'Activo' :
              contract.status === 'pending' ? 'Pendiente' :
              contract.status === 'expired' ? 'Expirado' :
              contract.status === 'cancelled' ? 'Cancelado' : 
              contract.status
            }</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Detalles adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fechas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de inicio</h3>
              <p>{new Date(contract.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de finalización</h3>
              <p>{new Date(contract.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Creado</h3>
              <p>{new Date(contract.createdAt).toLocaleDateString()}</p>
            </div>
            {contract.updatedAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Última actualización</h3>
                <p>{new Date(contract.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Información financiera</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Valor</h3>
              <p>{contract.value.toLocaleString()} {contract.currency}</p>
            </div>
            {contract.authorizedBy && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Autorizado por</h3>
                <p>{contract.authorizedBy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Descripción del contrato */}
      {contract.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{contract.description}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Suplementos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Suplementos</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/contracts/${id}/supplements/new`)}
            className="gap-2"
          >
            Añadir suplemento
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingSupplements ? (
            <div className="flex flex-col space-y-2 animate-pulse">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ) : supplementsError ? (
            <p className="text-destructive text-center py-4">Error al cargar suplementos</p>
          ) : !supplements || supplements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay suplementos para este contrato</p>
          ) : (
            <div className="space-y-2">
              {supplements.map((supplement) => (
                <div key={supplement.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{supplement.name}</p>
                    <p className="text-sm text-muted-foreground">Fecha: {new Date(supplement.effectiveDate).toLocaleDateString()}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/contracts/${id}/supplements/${supplement.id}`)}
                  >
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Adjuntos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documentos adjuntos</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            // Aquí iría una función para añadir archivos
            className="gap-2"
          >
            Añadir documento
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingAttachments ? (
            <div className="flex flex-col space-y-2 animate-pulse">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ) : attachmentsError ? (
            <p className="text-destructive text-center py-4">Error al cargar documentos</p>
          ) : !attachments || attachments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay documentos adjuntos</p>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded">
                      <IconFileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{attachment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(attachment.size / 1024).toFixed(2)} KB • {attachment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
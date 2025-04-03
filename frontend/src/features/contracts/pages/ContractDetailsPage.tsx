import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContract, useContractAttachments, useContractSupplements, useDeleteSupplement } from '../hooks/useContracts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconArrowLeft, IconEdit, IconTrash, IconFileText, IconFileDownload } from '@tabler/icons-react'
import { SupplementsList } from '../components/ContractDetailsPage/SupplementsList'
import { ContractService, type ContractAttachment } from '../services/contracts-service'
import { toast } from '@/hooks/useToast'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ContractStatus, ContractType, Role } from '@/types/enums'
import { Badge } from '@/components/ui/badge'

type ContractDetailsPageProps = {
  id: string;
  isPublic?: boolean;
}

export default function ContractDetailsPage({ id, isPublic = false }: ContractDetailsPageProps) {
  const navigate = useNavigate()
  const { tienePermiso } = useAuth()
  
  // Usar los hooks para obtener los datos del contrato y relacionados
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
  
  // Mutación para eliminar suplementos
  const { 
    execute: deleteSupplement,
    isLoading: isDeletingSupplement
  } = useDeleteSupplement(id)
  
  useEffect(() => {
    loadData()
  }, [id, loadData])
  
  // Manejar navegación a la lista de contratos
  const handleBack = () => {
    navigate('/contracts')
  }
  
  // Manejar navegación a la edición del contrato
  const handleEdit = () => {
    navigate(`/contracts/${id}/edit`)
  }
  
  // Manejar descarga del documento del contrato
  const handleDownloadDocument = () => {
    if (contract?.documentUrl) {
      ContractService.downloadContractDocument(id);
    }
  };
  
  // Eliminar un suplemento
  const handleDeleteSupplement = async (supplementId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este suplemento? Esta acción no se puede deshacer.')) {
      try {
        await deleteSupplement(supplementId);
        toast({
          title: "Suplemento eliminado",
          description: "El suplemento ha sido eliminado correctamente",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el suplemento",
          variant: "destructive"
        });
      }
    }
  };
  
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
          <CardTitle>Información del contrato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Número de contrato</h3>
              <p className="mt-1 text-sm">{contract.contractNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
              <p className="mt-1">
                <Badge variant={getStatusVariant(contract.status)}>{getStatusLabel(contract.status)}</Badge>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
              <p className="mt-1">
                <Badge variant="outline">{getTypeLabel(contract.type)}</Badge>
              </p>
            </div>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de inicio</h3>
              <p className="mt-1 text-sm">{formatDate(contract.startDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de fin</h3>
              <p className="mt-1 text-sm">{formatDate(contract.endDate)}</p>
            </div>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Empresa</h3>
              <p className="mt-1 text-sm">{contract.company?.name || 'No especificada'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Valor</h3>
              <p className="mt-1 text-sm">{formatCurrency(contract.amount, contract.currency)}</p>
            </div>
          </div>
          
          {contract.documentUrl && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadDocument} 
                className="flex items-center gap-2"
              >
                <IconFileDownload className="h-4 w-4" />
                Descargar documento
              </Button>
            </div>
          )}
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
      <SupplementsList 
        contractId={id}
        supplements={supplements}
        isLoading={isLoadingSupplements}
        error={supplementsError?.message}
        onDelete={handleDeleteSupplement}
      />
      
      {/* Adjuntos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documentos adjuntos</CardTitle>
          {tienePermiso([Role.ADMIN, Role.MANAGER]) && (
            <Button 
              variant="outline" 
              size="sm"
              // Aquí iría una función para añadir archivos
              className="gap-2"
            >
              Añadir documento
            </Button>
          )}
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
              {attachments.map((attachment: ContractAttachment) => (
                <div key={attachment.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded">
                      <IconFileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{attachment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(attachment.fileSize / 1024).toFixed(2)} KB • {attachment.fileType}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(attachment.fileUrl, '_blank')}
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
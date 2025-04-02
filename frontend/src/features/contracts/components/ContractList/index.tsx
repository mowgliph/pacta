import React from 'react'
import { useNavigate } from '@remix-run/react'
import {
  IconEye,
  IconPencil,
  IconTrash,
  IconFileText,
  IconBuildingStore,
  IconTruckDelivery,
  IconCalendarTime,
} from '@tabler/icons-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Contract } from '../../services/contracts-service'
import { ContractListSkeleton } from './ContractListSkeleton'
import { ContractListEmpty } from './ContractListEmpty'
import { ContractListError } from './ContractListError'
import { ContractCard } from '../ContractCard'
import { Skeleton } from '@/components/ui/skeleton'

interface ContractListProps {
  contracts: Contract[]
  isLoading?: boolean
  error?: string
  onRefresh?: () => void
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  isLoading = false,
  error,
  onRefresh,
}) => {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-4 border rounded-lg bg-card">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <ContractListError error={error} onRetry={onRefresh} />
  }

  if (!contracts.length) {
    return <ContractListEmpty onRefresh={onRefresh} />
  }

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  // Función para obtener el color de la insignia de estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success'
      case 'pending':
        return 'warning'
      case 'expired':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Función para obtener el texto de estado en español
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Activo'
      case 'pending':
        return 'Pendiente'
      case 'expired':
        return 'Expirado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  // Función para manejar ver detalles
  const handleViewContract = (id: string) => {
    navigate(`/contracts/${id}`)
  }

  // Función para manejar edición
  const handleEdit = (id: string) => {
    navigate(`/contracts/${id}/edit`)
  }

  // Función para agregar suplemento
  const handleAddSupplement = (id: string) => {
    navigate(`/contracts/${id}/supplements/new`)
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onClick={() => handleViewContract(contract.id)}
        />
      ))}
    </div>
  )
}
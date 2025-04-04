import React from 'react'
import { 
  IconBuilding, 
  IconCalendar, 
  IconCurrencyDollar, 
  IconEye,
  IconBuildingStore, 
  IconTruckDelivery,
  IconFiles
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Contract } from '../../services/contracts-service'
import { ContractType } from '@/types/enums'

// Formateador de fechas
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Mapeo de estados a variantes de Badge
const STATUS_VARIANTS: Record<string, string> = {
  active: 'success',
  pending: 'warning',
  expired: 'destructive',
  cancelled: 'default'
}

// Mapeo de estados a texto en español
const STATUS_TEXT: Record<string, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  expired: 'Expirado',
  cancelled: 'Cancelado'
}

// Propiedades del componente
type ContractCardProps = {
  contract: Contract
  onClick?: () => void
}

/**
 * Tarjeta que muestra información resumida de un contrato
 */
export const ContractCard: React.FC<ContractCardProps> = ({ 
  contract, 
  onClick 
}) => {
  const { 
    name, 
    contractNumber, 
    companyName, 
    startDate, 
    endDate, 
    status, 
    type,
    value,
    currency,
    hasSupplements
  } = contract
  
  // Ícono según el tipo de contrato
  const TypeIcon = type === ContractType.CLIENT ? IconBuildingStore : IconTruckDelivery
  const typeLabel = type === ContractType.CLIENT ? 'Cliente' : 'Proveedor'
  
  // Mapear el status a minúsculas para compatibilidad
  const statusLowerCase = typeof status === 'string' ? status.toLowerCase() : '';
  
  // Variante de la insignia según el estado
  const badgeVariant = STATUS_VARIANTS[statusLowerCase as keyof typeof STATUS_VARIANTS] || 'default'
  const statusText = STATUS_TEXT[statusLowerCase as keyof typeof STATUS_TEXT] || status
  
  return (
    <div
      className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3">
          <div className={`p-2 rounded-md ${type === ContractType.CLIENT ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
            <TypeIcon size={24} />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">{name}</h3>
              <Badge variant={badgeVariant as any}>
                {statusText}
              </Badge>
              {hasSupplements && (
                <Badge variant="outline" className="flex items-center gap-1 ml-1">
                  <IconFiles size={14} />
                  <span>Suplementos</span>
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-mono">{contractNumber}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <IconBuilding size={16} />
                <span>{companyName || 'Sin empresa'}</span>
              </div>
              
              {value && (
                <div className="flex items-center gap-1">
                  <IconCurrencyDollar size={16} />
                  <span>{value.toLocaleString('es')} {currency}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <IconCalendar size={16} />
                <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Button size="sm" variant="ghost" className="gap-1" onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}>
          <IconEye size={16} />
          <span>Ver</span>
        </Button>
      </div>
    </div>
  )
}
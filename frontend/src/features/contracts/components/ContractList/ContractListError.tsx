import React from 'react'
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

interface ContractListErrorProps {
  error: string
  onRetry?: () => void
}

export const ContractListError: React.FC<ContractListErrorProps> = ({ 
  error = 'No se pudieron cargar los contratos', 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-3 text-destructive">
        <IconAlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-xl font-semibold">Error al cargar contratos</h3>
      <p className="mt-2 text-muted-foreground">{error}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onRetry}
        >
          <IconRefresh className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  )
}
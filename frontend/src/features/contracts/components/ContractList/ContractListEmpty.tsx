import React from 'react'
import { IconFileOff, IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

interface ContractListEmptyProps {
  onRefresh?: () => void
}

export const ContractListEmpty: React.FC<ContractListEmptyProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <IconFileOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-xl font-semibold">No hay contratos disponibles</h3>
      <p className="mt-2 text-muted-foreground">
        No se encontraron contratos que coincidan con los criterios de búsqueda.
      </p>
      {onRefresh && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onRefresh}
        >
          <IconRefresh className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      )}
    </div>
  )
}
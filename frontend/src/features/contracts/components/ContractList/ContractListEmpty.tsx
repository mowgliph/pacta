import { IconFileOff } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

export function ContractListEmpty() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <IconFileOff size={48} className="text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">No hay contratos</h3>
      <p className="text-muted-foreground mb-4">
        No se encontraron contratos. Comienza creando uno nuevo.
      </p>
      <Button onClick={() => navigate({ to: '/contracts/new' })}>
        Crear Contrato
      </Button>
    </div>
  )
}
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { Contract } from '../../types/index'
import { formatDate } from '@/lib/utils'
import { useContractActions } from '../../hooks/useContractActions'

interface ContractCardProps {
  contrato: Contract
}

export function ContractCard({ contrato }: ContractCardProps) {
  const { handleEdit, handleDelete } = useContractActions()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="font-semibold">{contrato.titulo}</h3>
          <p className="text-sm text-muted-foreground">{contrato.codigo}</p>
        </div>
        <Badge variant={contrato.estado === 'activo' ? 'success' : 'warning'}>
          {contrato.estado}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>Fecha inicio: {formatDate(contrato.fechaInicio)}</p>
          <p>Fecha fin: {formatDate(contrato.fechaFin)}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(contrato.id)}
        >
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(contrato.id)}
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
import { type Contract } from '../../types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type ContractCardProps = {
  contract: Contract
}

export function ContractCard({ contract }: ContractCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{contract.title}</CardTitle>
        <Badge variant={getStatusVariant(contract.status)}>{contract.status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Número: {contract.contractNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            Vigencia: {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
          </p>
          {contract.company && (
            <p className="text-sm text-muted-foreground">
              Empresa: {contract.company.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusVariant(status: Contract['status']) {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'PENDING': return 'warning'
    case 'EXPIRED': return 'destructive'
    case 'CANCELLED': return 'secondary'
    default: return 'default'
  }
}
\"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Plus } from "lucide-react"
import { SupplementList } from "../supplements/supplement-list"
import { NewSupplementDialog } from "../supplements/NewSupplementDialog"
import { PermissionGate } from "../auth/permission-gate"

interface ContractSupplementsProps {
  contractId: string
  contractData: any
  onSupplementCreated?: () => void
}

/**
 * Componente para gestionar los suplementos de un contrato
 * Incluye la lista de suplementos y la opción para crear nuevos
 */
export function ContractSupplements({
  contractId,
  contractData,
  onSupplementCreated
}: ContractSupplementsProps) {
  const [isNewSupplementOpen, setIsNewSupplementOpen] = useState(false)

  const handleSupplementCreated = () => {
    setIsNewSupplementOpen(false)
    if (onSupplementCreated) {
      onSupplementCreated()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Suplementos del Contrato</CardTitle>
        <PermissionGate resource="contracts" action="update">
          <Button
            size="sm"
            onClick={() => setIsNewSupplementOpen(true)}
            disabled={contractData.status === "Archivado"}
          >
            <Plus className="mr-1 h-4 w-4" />
            Nuevo Suplemento
          </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent>
        <SupplementList contractId={contractId} />

        {/* Diálogo para crear nuevo suplemento */}
        <NewSupplementDialog
          isOpen={isNewSupplementOpen}
          onClose={() => setIsNewSupplementOpen(false)}
          contractId={contractId}
          onSuccess={handleSupplementCreated}
        />
      </CardContent>
    </Card>
  )
}
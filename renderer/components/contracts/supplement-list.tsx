"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { LoadingSpinner } from "../ui/loading-spinner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Download, Eye } from "lucide-react"
import { useSupplements } from "../../hooks/useSupplements"
import { SupplementDetailDialog } from "./SupplementDetailDialog"

interface SupplementListProps {
  contractId: string
}

export function SupplementList({ contractId }: SupplementListProps) {
  const { supplements, isLoading, fetchSupplements } = useSupplements(contractId)
  const [selectedSupplement, setSelectedSupplement] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchSupplements()
  }, [fetchSupplements])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Borrador</Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case "superseded":
        return <Badge className="bg-blue-100 text-blue-800">Reemplazado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case "modification":
        return <Badge className="bg-yellow-100 text-yellow-800">Modificación</Badge>
      case "extension":
        return <Badge className="bg-purple-100 text-purple-800">Extensión</Badge>
      case "termination":
        return <Badge className="bg-red-100 text-red-800">Terminación</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Suplementos del Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          {supplements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay suplementos registrados para este contrato</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="bg-muted p-3 border-b">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm">
                  <div className="col-span-2">Número</div>
                  <div className="col-span-3">Título</div>
                  <div className="col-span-2">Tipo</div>
                  <div className="col-span-2">Fecha Efectiva</div>
                  <div className="col-span-1">Estado</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>
              </div>

              <div className="divide-y">
                {supplements.map((supplement) => (
                  <div key={supplement.id} className="p-3 hover:bg-muted/50">
                    <div className="grid grid-cols-12 gap-2 items-center text-sm">
                      <div className="col-span-2">{supplement.supplementNumber}</div>
                      <div className="col-span-3 truncate" title={supplement.title}>
                        {supplement.title}
                      </div>
                      <div className="col-span-2">{getChangeTypeBadge(supplement.changeType)}</div>
                      <div className="col-span-2">{formatDate(supplement.effectiveDate)}</div>
                      <div className="col-span-1">{getStatusBadge(supplement.status)}</div>
                      <div className="col-span-2 flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSupplement(supplement)
                            setIsDetailOpen(true)
                          }}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {supplement.documents && supplement.documents.length > 0 && (
                          <Button variant="ghost" size="icon" asChild title="Descargar documento">
                            <a
                              href={`/api/documents/${supplement.documents[0].id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSupplement && (
        <SupplementDetailDialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          supplement={selectedSupplement}
        />
      )}
    </>
  )
}

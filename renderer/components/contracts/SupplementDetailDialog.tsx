"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"

interface SupplementDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  supplement: any
}

export function SupplementDetailDialog({ isOpen, onClose, supplement }: SupplementDetailDialogProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es })
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

  const formatChanges = (changes: any) => {
    if (!changes) return null

    return Object.entries(changes).map(([field, values]: [string, any]) => {
      const fieldLabels: Record<string, string> = {
        endDate: "Fecha de Fin",
        initialValue: "Valor",
        description: "Descripción",
        deliveryTerm: "Plazo de Entrega",
        paymentTerm: "Plazo de Pago",
        warrantyTerm: "Plazo de Garantía",
      }

      const fieldLabel = fieldLabels[field] || field

      // Formatear valores especiales
      let oldValue = values.oldValue
      let newValue = values.newValue

      if (field === "endDate" || field.includes("Date")) {
        oldValue = oldValue ? formatDate(oldValue) : "No definido"
        newValue = newValue ? formatDate(newValue) : "No definido"
      } else if (field === "initialValue" || field.includes("Value")) {
        oldValue = oldValue ? `${oldValue.amount} ${oldValue.currency}` : "No definido"
        newValue = newValue ? `${newValue.amount} ${newValue.currency}` : "No definido"
      }

      return (
        <div key={field} className="mb-4 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium text-sm">{fieldLabel}</h4>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-xs text-gray-500">Valor Anterior</p>
              <p className="text-sm">{oldValue}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Nuevo Valor</p>
              <p className="text-sm">{newValue}</p>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles del Suplemento</span>
            {getChangeTypeBadge(supplement.changeType)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Número de Suplemento</p>
            <p>{supplement.supplementNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Fecha Efectiva</p>
            <p>{formatDate(supplement.effectiveDate)}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Título</p>
          <p>{supplement.title}</p>
        </div>

        {supplement.description && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Descripción</p>
            <p>{supplement.description}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Cambios Realizados</p>
          <ScrollArea className="h-[300px] mt-2">{formatChanges(supplement.changes)}</ScrollArea>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Creado por</p>
            <p>{supplement.createdBy?.name || "Usuario desconocido"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
            <p>{formatDate(supplement.createdAt)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

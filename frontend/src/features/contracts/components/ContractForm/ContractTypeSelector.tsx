import React from 'react'
import { IconBuildingStore, IconTruckDelivery } from '@tabler/icons-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface ContractTypeSelectorProps {
  value: 'client' | 'provider'
  onChange: (value: 'client' | 'provider') => void
}

/**
 * Componente para seleccionar el tipo de contrato: cliente o proveedor
 */
export const ContractTypeSelector: React.FC<ContractTypeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <div className="text-sm font-medium mb-2">Tipo de contrato</div>
      <RadioGroup
        value={value}
        onValueChange={onChange as (value: string) => void}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem
            value="client"
            id="contract-type-client"
            className="peer sr-only"
          />
          <Label
            htmlFor="contract-type-client"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <IconBuildingStore className="mb-3 h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Cliente</p>
              <p className="text-sm text-muted-foreground">
                El cliente recibe servicios o productos
              </p>
            </div>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem
            value="provider"
            id="contract-type-provider"
            className="peer sr-only"
          />
          <Label
            htmlFor="contract-type-provider"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <IconTruckDelivery className="mb-3 h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Proveedor</p>
              <p className="text-sm text-muted-foreground">
                El proveedor entrega servicios o productos
              </p>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
} 
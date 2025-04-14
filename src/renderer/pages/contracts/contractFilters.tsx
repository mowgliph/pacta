import React from 'react';
import { Input } from "@/renderer/components/ui/input";
import { Calendar } from "@/renderer/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Button } from "@/renderer/components/ui/button";
import { ContractFilters as IContractFilters } from '@/renderer/types/contracts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContractFiltersProps {
  onFilterChange: (filters: IContractFilters) => void;
}

const ContractFilters: React.FC<ContractFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = React.useState<IContractFilters>({
    status: '',
    clientName: '',
    startDate: '',
    endDate: '',
    type: ''
  });

  const handleInputChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      [field]: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const clearFilters: IContractFilters = {
      status: '',
      clientName: '',
      startDate: '',
      endDate: '',
      type: ''
    };
    setFilters(clearFilters);
    onFilterChange(clearFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="Active">Activo</SelectItem>
                <SelectItem value="Expired">Vencido</SelectItem>
                <SelectItem value="Pending">Pendiente</SelectItem>
                <SelectItem value="Terminated">Terminado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleInputChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="proveedor">Proveedor</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre/Cliente</label>
          <Input
            value={filters.clientName}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            placeholder="Buscar por nombre..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha Inicio</label>
          <Calendar
            mode="single"
            selected={filters.startDate ? new Date(filters.startDate) : undefined}
            onSelect={(date) => handleDateChange('startDate', date || null)}
            disabled={(date) =>
              filters.endDate ? date > new Date(filters.endDate) : false
            }
            locale={es}
            initialFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha Fin</label>
          <Calendar
            mode="single"
            selected={filters.endDate ? new Date(filters.endDate) : undefined}
            onSelect={(date) => handleDateChange('endDate', date || null)}
            disabled={(date) =>
              filters.startDate ? date < new Date(filters.startDate) : false
            }
            locale={es}
            initialFocus
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClearFilters}>
          Limpiar Filtros
        </Button>
        <Button onClick={handleApplyFilters}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default ContractFilters;
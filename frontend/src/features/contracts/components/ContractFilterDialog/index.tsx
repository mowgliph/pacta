import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Filter } from 'lucide-react';
import { ContractStatus, ContractType } from '@/types/enums';
import { Separator } from '@/components/ui/separator';
import { ContractSearchParams } from '../../services/contracts-service';
import { Badge } from '@/components/ui/badge';

interface ContractFilterDialogProps {
  initialFilters?: Partial<ContractSearchParams>;
  onFilterChange: (filters: Partial<ContractSearchParams>) => void;
}

/**
 * Componente diálogo para filtrar contratos por tipo, estado, fechas, etc.
 */
export const ContractFilterDialog: React.FC<ContractFilterDialogProps> = ({ 
  initialFilters = {}, 
  onFilterChange 
}) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Partial<ContractSearchParams>>(initialFilters);
  const [tempFilters, setTempFilters] = useState<Partial<ContractSearchParams>>(initialFilters);
  
  // Actualizar filtros temporales
  const handleFilterChange = (key: keyof ContractSearchParams, value: any) => {
    setTempFilters((prev: Partial<ContractSearchParams>) => ({ ...prev, [key]: value }));
  };
  
  // Sincronizar con cambios en initialFilters
  useEffect(() => {
    setFilters(initialFilters);
    setTempFilters(initialFilters);
  }, [initialFilters]);
  
  // Aplicar filtros
  const handleApply = () => {
    setFilters(tempFilters);
    onFilterChange(tempFilters);
    setOpen(false);
  };
  
  // Resetear filtros
  const handleReset = () => {
    const emptyFilters: Partial<ContractSearchParams> = {};
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };
  
  // Obtener cuántos filtros hay aplicados
  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      // No contar page y limit como filtros activos
      if (key === 'page' || key === 'limit') return false;
      return value !== undefined && value !== '';
    }).length;
  };
  
  const activeFilterCount = getActiveFilterCount();
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filtrar contratos</DialogTitle>
          <DialogDescription>
            Utilice estas opciones para filtrar la lista de contratos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={tempFilters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value={ContractStatus.ACTIVE}>Activo</SelectItem>
                  <SelectItem value={ContractStatus.DRAFT}>Borrador</SelectItem>
                  <SelectItem value={ContractStatus.EXPIRED}>Vencido</SelectItem>
                  <SelectItem value={ContractStatus.CANCELLED}>Cancelado</SelectItem>
                  <SelectItem value={ContractStatus.RENEWAL}>En renovación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={tempFilters.type || ''}
                onValueChange={(value) => handleFilterChange('type', value || undefined)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value={ContractType.CLIENT}>Cliente</SelectItem>
                  <SelectItem value={ContractType.PROVIDER}>Proveedor</SelectItem>
                  <SelectItem value={ContractType.EMPLOYEE}>Empleado</SelectItem>
                  <SelectItem value={ContractType.OTHER}>Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Filtros adicionales para contratos según su tipo */}
          {tempFilters.type === ContractType.CLIENT && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Filtros específicos para clientes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientSector">Sector del cliente</Label>
                  <Select
                    value={tempFilters.clientSector || ''}
                    onValueChange={(value) => handleFilterChange('clientSector', value || undefined)}
                  >
                    <SelectTrigger id="clientSector">
                      <SelectValue placeholder="Todos los sectores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los sectores</SelectItem>
                      <SelectItem value="technology">Tecnología</SelectItem>
                      <SelectItem value="healthcare">Salud</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {tempFilters.type === ContractType.PROVIDER && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Filtros específicos para proveedores</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="providerCategory">Categoría del proveedor</Label>
                  <Select
                    value={tempFilters.providerCategory || ''}
                    onValueChange={(value) => handleFilterChange('providerCategory', value || undefined)}
                  >
                    <SelectTrigger id="providerCategory">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="products">Productos</SelectItem>
                      <SelectItem value="consulting">Consultoría</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Buscar por nombre, número..."
              value={tempFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio desde</Label>
              <DatePicker
                date={tempFilters.startDate ? new Date(tempFilters.startDate) : undefined}
                setDate={(date) => handleFilterChange('startDate', date ? date.toISOString() : undefined)}
                placeholder="Seleccionar fecha"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin hasta</Label>
              <DatePicker
                date={tempFilters.endDate ? new Date(tempFilters.endDate) : undefined}
                setDate={(date) => handleFilterChange('endDate', date ? date.toISOString() : undefined)}
                placeholder="Seleccionar fecha"
              />
            </div>
          </div>
          
          {/* Ordenar por */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Ordenar por</Label>
            <Select
              value={tempFilters.sortBy || ''}
              onValueChange={(value) => handleFilterChange('sortBy', value || undefined)}
            >
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Por defecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Por defecto</SelectItem>
                <SelectItem value="createdAt">Fecha de creación</SelectItem>
                <SelectItem value="startDate">Fecha de inicio</SelectItem>
                <SelectItem value="endDate">Fecha de fin</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="contractNumber">Número de contrato</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {tempFilters.sortBy && (
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Orden</Label>
              <Select
                value={tempFilters.sortOrder || 'desc'}
                onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
              >
                <SelectTrigger id="sortOrder">
                  <SelectValue placeholder="Descendente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descendente</SelectItem>
                  <SelectItem value="asc">Ascendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Resetear
          </Button>
          <Button onClick={handleApply}>Aplicar filtros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
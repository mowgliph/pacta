import React from 'react';
import { VList } from 'virtua';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/renderer/components/ui/table';
import { Button } from '@/renderer/components/ui/button';
import { Badge } from '@/renderer/components/ui/badge';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Contract } from '@/renderer/types/contracts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useStore from '@/renderer/store/useStore';

interface VirtualizedContractTableProps {
  contracts: Contract[];
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
}

const VirtualizedContractTable: React.FC<VirtualizedContractTableProps> = ({
  contracts,
  onView,
  onEdit,
  onDelete,
}) => {
  const userRole = useStore((state) => state.user?.role);
  const canEdit = userRole === 'Admin' || userRole === 'RA';
  const canDelete = userRole === 'Admin' || userRole === 'RA';

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expired':
        return 'destructive';
      case 'Pending':
        return 'secondary';
      case 'Terminated':
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  const renderRow = React.useCallback((index: number) => {
    const contract = contracts[index];
    return (
      <TableRow key={contract.id}>
        <TableCell>{contract.name}</TableCell>
        <TableCell>
          <Badge variant="outline">
            {contract.type === 'cliente' ? 'Cliente' : 'Proveedor'}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusBadgeVariant(contract.status)}>
            {contract.status}
          </Badge>
        </TableCell>
        <TableCell>{formatDate(contract.startDate)}</TableCell>
        <TableCell>{formatDate(contract.endDate)}</TableCell>
        <TableCell className="text-right space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(contract)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(contract)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(contract.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  }, [contracts, canEdit, canDelete, onView, onEdit, onDelete]);

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <VList
            className="max-h-[600px] overflow-auto"
            style={{ contain: 'strict' }}
            count={contracts.length}
            itemSize={64}
            overscan={5}
          >
            {renderRow}
          </VList>
        </TableBody>
      </Table>
    </div>
  );
};

export default VirtualizedContractTable;
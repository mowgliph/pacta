import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Contract } from '../types/contracts';

interface ContractTableProps {
  contracts: Contract[];
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
}

const getStatusColor = (status: Contract['status']) => {
  const colors = {
    Active: 'bg-green-500',
    Expired: 'bg-red-500',
    Pending: 'bg-yellow-500',
    Terminated: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

const ContractTable: React.FC<ContractTableProps> = ({
  contracts,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.name}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(contract.status)}>
                  {contract.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(contract.startDate), 'PPP', { locale: es })}
              </TableCell>
              <TableCell>
                {format(new Date(contract.endDate), 'PPP', { locale: es })}
              </TableCell>
              <TableCell className="space-x-2 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(contract)}
                >
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(contract)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(contract)}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractTable;
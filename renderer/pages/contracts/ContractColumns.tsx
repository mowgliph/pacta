import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

// Tipos
export type ContractStatus = 'active' | 'expired' | 'pending' | 'terminated';

export interface Contract {
  id: string;
  name: string;
  supplier: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  value: number;
  currency: string;
}

// Mapeo de estados a estilos
const statusMap: Record<ContractStatus, { text: string; className: string }> = {
  active: { text: 'Activo', className: 'bg-green-100 text-green-800' },
  expired: { text: 'Expirado', className: 'bg-red-100 text-red-800' },
  pending: { text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  terminated: { text: 'Terminado', className: 'bg-gray-100 text-gray-800' },
};

// Formateador de fechas
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Fecha inválida';
  }
};

// Formateador de moneda
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const useContractColumns = (): ColumnDef<Contract>[] => {
  const navigate = useNavigate();

  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-2"
            >
              Nombre
              {isSorted === 'asc' ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : isSorted === 'desc' ? (
                <ArrowDownIcon className="h-4 w-4" />
              ) : (
                <span className="h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'supplier',
        header: 'Proveedor',
      },
      {
        accessorKey: 'startDate',
        header: 'Fecha Inicio',
        cell: ({ row }) => formatDate(row.getValue('startDate')),
      },
      {
        accessorKey: 'endDate',
        header: 'Fecha Fin',
        cell: ({ row }) => formatDate(row.getValue('endDate')),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.getValue('status') as ContractStatus;
          const statusInfo = statusMap[status] || { 
            text: 'Desconocido', 
            className: 'bg-gray-100 text-gray-800' 
          };

          return (
            <span 
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
            >
              {statusInfo.text}
            </span>
          );
        },
      },
      {
        accessorKey: 'value',
        header: 'Valor',
        cell: ({ row }) => (
          <div className="font-medium">
            {formatCurrency(
              parseFloat(row.getValue('value')), 
              row.original.currency
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/contracts/${row.original.id}`)}
          >
            Ver Detalles
          </Button>
        ),
      },
    ],
    [navigate]
  );
};

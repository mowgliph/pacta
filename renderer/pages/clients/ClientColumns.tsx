import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

// Tipos
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'inactive' | 'pending';
  contractCount: number;
  lastContractDate?: string;
  createdAt: string;
}

// Mapeo de estados a estilos
const statusMap = {
  active: { text: 'Activo', className: 'bg-green-100 text-green-800' },
  inactive: { text: 'Inactivo', className: 'bg-red-100 text-red-800' },
  pending: { text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
} as const;

// Formateador de fechas
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
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

export const useClientColumns = (): ColumnDef<Client>[] => {
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
              Nombre del Cliente
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
          <div className="font-medium">
            <div>{row.getValue('name')}</div>
            {row.original.company && (
              <div className="text-sm text-muted-foreground">
                {row.original.company}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Correo Electrónico',
      },
      {
        accessorKey: 'phone',
        header: 'Teléfono',
      },
      {
        accessorKey: 'contractCount',
        header: 'Contratos',
        cell: ({ row }) => (
          <div className="text-center">{row.getValue('contractCount')}</div>
        ),
      },
      {
        accessorKey: 'lastContractDate',
        header: 'Último Contrato',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.getValue('lastContractDate'))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.getValue('status') as keyof typeof statusMap;
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
        accessorKey: 'createdAt',
        header: 'Fecha de Registro',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.getValue('createdAt'))}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clients/${row.original.id}`)}
          >
            Ver Detalles
          </Button>
        ),
      },
    ],
    [navigate]
  );
};

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';

// Tipos
export type UserRole = 'admin' | 'manager' | 'user' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
}

// Mapeo de roles a estilos
const roleMap = {
  admin: { text: 'Administrador', className: 'bg-purple-100 text-purple-800' },
  manager: { text: 'Gerente', className: 'bg-blue-100 text-blue-800' },
  user: { text: 'Usuario', className: 'bg-gray-100 text-gray-800' },
  auditor: { text: 'Auditor', className: 'bg-amber-100 text-amber-800' },
} as const;

// Mapeo de estados a estilos
const statusMap = {
  active: { text: 'Activo', className: 'bg-green-100 text-green-800' },
  inactive: { text: 'Inactivo', className: 'bg-red-100 text-red-800' },
  pending: { text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
} as const;

// Formateador de fechas
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Nunca';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Fecha inválida';
  }
};

export const useUserColumns = (): ColumnDef<User>[] => {
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
                <IconArrowUp className="h-4 w-4" />
              ) : isSorted === 'desc' ? (
                <IconArrowDown className="h-4 w-4" />
              ) : (
                <span className="h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.avatar ? (
              <img 
                src={row.original.avatar} 
                alt={row.original.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                {row.original.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-sm text-muted-foreground">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => {
          const role = row.getValue('role') as keyof typeof roleMap;
          const roleInfo = roleMap[role] || { 
            text: 'Desconocido', 
            className: 'bg-gray-100 text-gray-800' 
          };

          return (
            <span 
              className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}
            >
              {roleInfo.text}
            </span>
          );
        },
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
        accessorKey: 'lastLogin',
        header: 'Último Acceso',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.getValue('lastLogin'))}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Fecha de Creación',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.getValue('createdAt'))}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/users/${row.original.id}/edit`)}
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/80"
              onClick={() => {}}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  );
};

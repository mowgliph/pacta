import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsersList } from '../hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserStatus, UserRole } from '../types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationButton } from '@/components/ui/pagination';

const UsersList: React.FC = () => {
  // Estado para los filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
  });

  // Obtener lista de usuarios con los filtros actuales
  const { data, isLoading, isError, error } = useUsersList(filters);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Manejar cambio de filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchInput = (e.target as HTMLFormElement).search as HTMLInputElement;
    setFilters((prev) => ({ ...prev, search: searchInput.value, page: 1 }));
  };

  // Renderizar badge de estado
  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <Badge className="bg-green-500">Activo</Badge>;
      case UserStatus.INACTIVE:
        return <Badge className="bg-gray-500">Inactivo</Badge>;
      case UserStatus.SUSPENDED:
        return <Badge className="bg-amber-500">Suspendido</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>;
    }
  };

  // Renderizar skeleton de carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Renderizar mensaje de error
  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h3 className="text-lg font-medium text-red-800">Error al cargar usuarios</h3>
        <p className="mt-2 text-sm text-red-700">{error?.message || 'Ha ocurrido un error desconocido'}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Intentar nuevamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabecera y acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Usuarios</h2>
        <Button asChild>
          <Link to="/users/new">Nuevo Usuario</Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4">
        <form onSubmit={handleSearch} className="flex items-end gap-2">
          <div className="grid gap-1.5">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <Input 
              id="search" 
              name="search" 
              placeholder="Nombre, correo, etc."
              defaultValue={filters.search}
            />
          </div>
          <Button type="submit" variant="secondary">Buscar</Button>
        </form>

        <div className="grid gap-1.5">
          <label htmlFor="role" className="text-sm font-medium">Rol</label>
          <Select 
            value={filters.role}
            onValueChange={(value) => handleFilterChange('role', value)}
          >
            <SelectTrigger id="role" className="w-[180px]">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="status" className="text-sm font-medium">Estado</label>
          <Select 
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger id="status" className="w-[180px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {Object.values(UserStatus).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items && data.items.length > 0 ? (
              data.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{renderStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/users/${user.id}`}>Ver</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/users/${user.id}/edit`}>Editar</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-end">
          <PaginationButton
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default UsersList; 
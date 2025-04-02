import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { useUsersList } from "../hooks/useUsers";
import { UserSearchParams } from "../types";
import { UserStatus } from "@/types/enums";
import { IconSearch, IconX, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Página que muestra el listado de usuarios del sistema
 * con opciones de búsqueda y acciones
 */
export function UsersListPage() {
  // Estado para los parámetros de búsqueda
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    page: 1,
    limit: 10,
    search: "",
  });
  
  // Usar el hook SWR para obtener los usuarios
  const { 
    data: usersResponse, 
    isLoading, 
    error, 
    mutate 
  } = useUsersList(searchParams);

  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejar búsqueda
  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      search: searchTerm,
      page: 1, // Resetear a la primera página
    });
  };

  // Manejar limpieza de búsqueda
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchParams({
      ...searchParams,
      search: "",
      page: 1,
    });
  };

  // Manejar click en añadir usuario
  const handleAddUser = () => {
    console.log("Añadir usuario");
    // Aquí se podría mostrar un modal o navegar a la página de creación
  };

  // Obtener el estado del badge según el status
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Activo
          </Badge>
        );
      case UserStatus.INACTIVE:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Inactivo
          </Badge>
        );
      case UserStatus.SUSPENDED:
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Suspendido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            Desconocido
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
        <Button onClick={handleAddUser}>
          <IconPlus className="mr-2 h-4 w-4" />
          Añadir usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de usuarios</CardTitle>
          <CardDescription>
            Administra los usuarios que tienen acceso al sistema.
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 pt-4">
            <div className="relative w-full">
              <Input 
                type="text" 
                placeholder="Buscar usuario..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="pr-10"
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={handleClearSearch}
                >
                  <IconX className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button 
              type="button" 
              variant="secondary"
              onClick={handleSearch}
              disabled={isLoading}
            >
              <IconSearch className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-red-600 mb-2">Ha ocurrido un error al cargar los usuarios.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => mutate()}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Esqueletos para carga
                  Array(3).fill(0).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  usersResponse?.data?.length ? (
                    usersResponse.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          {getStatusBadge(user.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <IconEdit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          )}
          
          {/* Paginación */}
          {usersResponse && usersResponse.totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={searchParams.page === 1 || isLoading}
                onClick={() => setSearchParams({
                  ...searchParams,
                  page: Math.max(1, (searchParams.page || 1) - 1)
                })}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {searchParams.page} de {usersResponse.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={searchParams.page === usersResponse.totalPages || isLoading}
                onClick={() => setSearchParams({
                  ...searchParams,
                  page: Math.min(usersResponse.totalPages, (searchParams.page || 1) + 1)
                })}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
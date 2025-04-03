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
import { useUsers, type User } from "../hooks/useUsers";
import { UserSearchParams } from "../types";
import { UserStatus } from "@/types/enums";
import { IconSearch, IconX, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';

/**
 * Página que muestra el listado de usuarios del sistema
 * con opciones de búsqueda y acciones
 */
const UsersListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { getUsers } = useUsers();
  const { data, isLoading, isError } = getUsers(page, limit);
  
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
        <div className="p-4 text-center">Cargando usuarios...</div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
        <div className="p-4 text-center text-red-600">
          Error al cargar los usuarios. Por favor, inténtalo de nuevo.
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Link 
          to="/users/new" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Nuevo usuario
        </Link>
      </div>
      
      <div className="bg-card rounded-lg overflow-hidden shadow">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Rol</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((user: User) => (
              <tr key={user.id} className="border-t border-muted">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <Link 
                    to={`/users/${user.id}`} 
                    className="text-primary hover:underline mx-1"
                  >
                    Ver
                  </Link>
                  <Link 
                    to={`/users/${user.id}/edit`} 
                    className="text-primary hover:underline mx-1"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No hay usuarios para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div>
            Mostrando {data.items.length} de {data.totalItems} usuarios
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-3 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersListPage; 
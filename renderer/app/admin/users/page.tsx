import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/lib/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Plus, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { UserTableRow } from './UserTableRow';

export default function UsersPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users = [], loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  // Redirigir si no está autenticado o no tiene permisos
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!hasRole(['admin'])) {
      navigate('/unauthorized');
    }
  }, [user, navigate, hasRole]);

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      const response = await window.electron.users.toggleActive(userId);
      
      if (response?.success) {
        toast({
          title: `Usuario ${newStatus ? 'activado' : 'desactivado'}`,
          description: `El estado del usuario ha sido actualizado correctamente.`,
          variant: 'default',
        });
        
        // Recargar la lista de usuarios
        window.location.reload();
      } else {
        throw new Error(response?.error?.message || 'Error al actualizar el estado del usuario');
      }
    } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el estado del usuario.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !hasRole(['admin'])) {
    return null;
  }

  if (loading) {
    return <div className="p-4">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error al cargar los usuarios: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">Administra los usuarios y sus permisos en el sistema</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/admin/users/new">
            <Button className="bg-azul-medio hover:bg-azul-oscuro">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar usuarios..."
              type="search"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <UserTableRow 
                  key={user.id}
                  user={user} 
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">3</span> de <span className="font-medium">3</span> usuarios
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

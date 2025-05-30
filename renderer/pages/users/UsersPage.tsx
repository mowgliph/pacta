import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useUserColumns, type User } from './UserColumns';

export default function UsersPage() {
  const { isAuthenticated, isLoading, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const columns = useUserColumns();
  
  // Datos de ejemplo - Reemplazar con llamada a la API real
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Admin Principal',
      email: 'admin@empresa.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-05-30T15:30:00',
      createdAt: '2023-01-01',
      avatar: 'https://ui-avatars.com/api/?name=Admin+Principal&background=7c3aed&color=fff',
    },
    {
      id: '2',
      name: 'Gerente de Ventas',
      email: 'gerente@empresa.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-05-30T14:15:00',
      createdAt: '2023-02-15',
      avatar: 'https://ui-avatars.com/api/?name=Gerente+Ventas&background=3b82f6&color=fff',
    },
    {
      id: '3',
      name: 'Analista Contable',
      email: 'contable@empresa.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-05-29T11:20:00',
      createdAt: '2023-03-20',
    },
    {
      id: '4',
      name: 'Auditor Interno',
      email: 'auditor@empresa.com',
      role: 'auditor',
      status: 'active',
      lastLogin: '2024-05-30T10:00:00',
      createdAt: '2023-04-10',
    },
    {
      id: '5',
      name: 'Nuevo Usuario',
      email: 'nuevo@empresa.com',
      role: 'user',
      status: 'pending',
      createdAt: '2024-05-28',
    },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Simular carga de datos
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Simulamos un retraso de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Usamos los datos de ejemplo
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, isLoading, navigate]);

  // Verificar permisos de administrador
  const isAdmin = currentUser?.role === 'admin';

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los usuarios y permisos del sistema
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/users/new')}>
            Nuevo Usuario
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable 
          columns={columns} 
          data={users} 
          searchKey="name"
          loading={loading}
          placeholder="Buscar usuarios..."
        />
      </div>

      {!isAdmin && (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-md text-sm">
          <p>Solo los administradores pueden gestionar usuarios.</p>
        </div>
      )}
    </div>
  );
}

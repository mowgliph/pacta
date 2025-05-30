import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useClientColumns, type Client } from './ClientColumns';

export default function ClientsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const columns = useClientColumns();
  
  // Datos de ejemplo - Reemplazar con llamada a la API real
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'María López',
      email: 'maria.lopez@empresa.com',
      phone: '+34 600 111 222',
      company: 'Acme Corp',
      status: 'active',
      contractCount: 5,
      lastContractDate: '2024-05-15',
      createdAt: '2023-01-15',
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      email: 'carlos.ruiz@techsolutions.com',
      phone: '+34 611 222 333',
      company: 'Tech Solutions',
      status: 'active',
      contractCount: 12,
      lastContractDate: '2024-05-20',
      createdAt: '2022-11-20',
    },
    {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana.martinez@innovatec.es',
      phone: '+34 622 333 444',
      company: 'Innovatec',
      status: 'pending',
      contractCount: 0,
      createdAt: '2024-05-25',
    },
    {
      id: '4',
      name: 'Javier García',
      email: 'javier.garcia@globalnet.com',
      phone: '+34 633 444 555',
      company: 'GlobalNet',
      status: 'inactive',
      contractCount: 3,
      lastContractDate: '2023-12-10',
      createdAt: '2022-08-10',
    },
    {
      id: '5',
      name: 'Laura Díaz',
      email: 'laura.diaz@futuretech.com',
      phone: '+34 644 555 666',
      company: 'FutureTech',
      status: 'active',
      contractCount: 8,
      lastContractDate: '2024-04-30',
      createdAt: '2023-03-22',
    },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Simular carga de datos
    const fetchClients = async () => {
      setLoading(true);
      try {
        // Simulamos un retraso de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Usamos los datos de ejemplo
        setClients(mockClients);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [isAuthenticated, isLoading, navigate]);

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
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los clientes de tu organización
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            Exportar
          </Button>
          <Button onClick={() => navigate('/clients/new')}>
            Nuevo Cliente
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable 
          columns={columns} 
          data={clients} 
          searchKey="name"
          loading={loading}
          placeholder="Buscar clientes..."
        />
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useSupplierColumns, type Supplier } from './SupplierColumns';

export default function SuppliersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const columns = useSupplierColumns();
  
  // Datos de ejemplo - Reemplazar con llamada a la API real
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'Tecnología Avanzada S.A.',
      contactName: 'María González',
      email: 'contacto@tecnologia-avanzada.com',
      phone: '+34 912 345 678',
      status: 'active',
      contractCount: 3,
      lastContractDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Soporte Técnico Integral',
      contactName: 'Carlos Mendoza',
      email: 'soporte@stintegral.com',
      phone: '+34 600 123 456',
      status: 'active',
      contractCount: 5,
      lastContractDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Consultores Asociados',
      contactName: 'Ana López',
      email: 'info@consultores-asociados.es',
      phone: '+34 911 234 567',
      status: 'inactive',
      contractCount: 1,
      lastContractDate: '2023-11-01',
    },
    {
      id: '4',
      name: 'Soluciones Digitales SL',
      contactName: 'Javier Ruiz',
      email: 'javier.ruiz@soluciones-digitales.com',
      phone: '+34 622 334 455',
      status: 'pending',
      contractCount: 0,
    },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Simular carga de datos
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        // Simulamos un retraso de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Usamos los datos de ejemplo
        setSuppliers(mockSuppliers);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
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
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            Exportar
          </Button>
          <Button onClick={() => navigate('/suppliers/new')}>
            Nuevo Proveedor
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable 
          columns={columns} 
          data={suppliers} 
          searchKey="name"
          loading={loading}
          placeholder="Buscar proveedores..."
        />
      </div>
    </div>
  );
}

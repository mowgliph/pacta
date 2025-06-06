import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useContractColumns, Contract } from './ContractColumns';

export default function ContractsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const columns = useContractColumns();
  
  // Datos de ejemplo - Reemplazar con llamada a la API real
  const mockContracts: Contract[] = [
    {
      id: '1',
      name: 'Contrato de Servicios TI',
      supplier: 'Tecnología Avanzada S.A.',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      value: 50000,
      currency: 'USD',
    },
    {
      id: '2',
      name: 'Mantenimiento de Equipos',
      supplier: 'Soporte Técnico Integral',
      startDate: '2024-02-15',
      endDate: '2024-12-15',
      status: 'active',
      value: 25000,
      currency: 'USD',
    },
    {
      id: '3',
      name: 'Servicios de Consultoría',
      supplier: 'Consultores Asociados',
      startDate: '2023-11-01',
      endDate: '2024-11-01',
      status: 'expired',
      value: 35000,
      currency: 'USD',
    },
  ];

  useEffect(() => {
    // Simular carga de datos
    const fetchContracts = async () => {
      setLoading(true);
      try {
        // Simulamos un retraso de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Usamos los datos de ejemplo
        setContracts(mockContracts);
      } catch (error) {
        console.error('Error al cargar contratos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contratos</h1>
        <Button onClick={() => navigate('/contracts/new')}>
          Nuevo Contrato
        </Button>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable 
          columns={columns} 
          data={contracts} 
          searchKey="name"
          loading={loading}
        />
      </div>
    </div>
  );
}

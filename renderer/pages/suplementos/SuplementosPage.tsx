import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useSuplementoColumns, Suplemento } from './SuplementoColumns';
import { useToast } from '@/components/ui/use-toast';

export default function SuplementosPage() {
  const { id: contratoId } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [suplementos, setSuplementos] = useState<Suplemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [contratoNombre, setContratoNombre] = useState('');
  const columns = useSuplementoColumns();
  
  // Datos de ejemplo - Reemplazar con llamada a la API real
  const mockSuplementos: Suplemento[] = [
    {
      id: '1',
      contratoId: contratoId || '',
      nombre: 'Ampliación de plazo',
      descripcion: 'Ampliación del plazo de ejecución por 30 días adicionales',
      fechaSolicitud: '2024-05-15',
      fechaAprobacion: '2024-05-20',
      estado: 'activo',
      monto: 0,
      moneda: 'USD',
      documentoUrl: '/docs/suplemento1.pdf',
    },
    {
      id: '2',
      contratoId: contratoId || '',
      nombre: 'Incremento de presupuesto',
      descripcion: 'Aumento del presupuesto por servicios adicionales',
      fechaSolicitud: '2023-01-15',
      fechaAprobacion: '2023-01-20',
      estado: 'vencido',
      monto: 5000,
      moneda: 'USD',
    },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!contratoId) {
      toast({
        title: 'Error',
        description: 'No se ha especificado un contrato',
        variant: 'destructive',
      });
      navigate('/contratos');
      return;
    }

    // Simular carga de datos
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulamos un retraso de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // En una implementación real, aquí haríamos una llamada a la API
        // para obtener los suplementos del contrato específico
        setSuplementos(mockSuplementos);
        
        // También obtendríamos el nombre del contrato
        setContratoNombre('Contrato de Servicios TI'); // Valor de ejemplo
      } catch (error) {
        console.error('Error al cargar suplementos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los suplementos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isLoading, navigate, contratoId, toast]);

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
          <h1 className="text-2xl font-bold">Suplementos</h1>
          {contratoNombre && (
            <p className="text-sm text-muted-foreground">
              Contrato: {contratoNombre}
            </p>
          )}
        </div>
        <Button 
          onClick={() => navigate(`/contracts/${contratoId}/suplementos/nuevo`)}
        >
          Nuevo Suplemento
        </Button>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm">
        {suplementos.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No hay suplementos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No se han encontrado suplementos para este contrato.
            </p>
            <Button
              onClick={() => navigate(`/contratos/${contratoId}/suplementos/nuevo`)}
              variant="outline"
            >
              Crear suplemento
            </Button>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={suplementos} 
            searchKey="nombre"
            loading={loading}
            placeholder="Buscar suplementos..."
          />
        )}
      </div>
    </div>
  );
}

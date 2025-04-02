import React from 'react';
import { Link, useNavigate } from '@remix-run/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  IconPlus, 
  IconFileSearch, 
  IconSettings, 
  IconBell, 
  IconFileUpload,
  IconChartBar
} from '@tabler/icons-react';

/**
 * Componente de acciones rápidas para el dashboard
 */
export const QuickActions: React.FC = () => {
  // Hook de navegación
  const _navigate = useNavigate();

  // Ejemplos de acciones comunes
  const handleCreateContract = () => {
    // Aquí iría la lógica para crear un contrato
    // Por ahora solo mostramos un log
    console.warn('Creación de contrato no implementada');
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Botón de crear contrato */}
          <Button 
            variant="outline" 
            className="flex items-center gap-2 justify-start p-4 h-auto min-h-16"
            onClick={handleCreateContract}
          >
            <IconPlus className="h-5 w-5 text-primary" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Crear Contrato</span>
              <span className="text-xs text-muted-foreground">Nuevo contrato</span>
            </div>
          </Button>

          {/* Botón de subir documento */}
          <Button 
            variant="outline" 
            className="flex items-center gap-2 justify-start p-4 h-auto min-h-16"
            asChild
          >
            <Link to="/documents/upload">
              <IconFileUpload className="h-5 w-5 text-blue-500" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Subir Documento</span>
                <span className="text-xs text-muted-foreground">Añadir documento</span>
              </div>
            </Link>
          </Button>

          {/* Botón de buscar contrato */}
          <Button 
            variant="outline" 
            className="flex items-center gap-2 justify-start p-4 h-auto min-h-16"
            asChild
          >
            <Link to="/contracts/search">
              <IconFileSearch className="h-5 w-5 text-amber-500" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Buscar Contrato</span>
                <span className="text-xs text-muted-foreground">Búsqueda avanzada</span>
              </div>
            </Link>
          </Button>

          {/* Botón de estadísticas */}
          <Button 
            variant="outline" 
            className="flex items-center gap-2 justify-start p-4 h-auto min-h-16"
            asChild
          >
            <Link to="/statistics">
              <IconChartBar className="h-5 w-5 text-emerald-500" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Estadísticas</span>
                <span className="text-xs text-muted-foreground">Ver informes</span>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 
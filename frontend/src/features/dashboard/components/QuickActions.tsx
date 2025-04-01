import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  IconPlus, 
  IconFileImport, 
  IconClipboardList, 
  IconUser, 
  IconBuildingStore 
} from '@tabler/icons-react';

type ActionItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
};

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  // Función de manejo de navegación
  const handleNavigate = (path: string) => {
    // Crear una función que maneje la navegación
    // Por ahora, simplemente loguea la ruta a la que se debería navegar
    console.log(`Navegando a: ${path}`);
    // En un futuro, cuando las rutas estén definidas correctamente:
    // navigate({ to: path as any });
  };

  // Definir acciones rápidas
  const actions: ActionItem[] = [
    {
      title: 'Nuevo Contrato',
      description: 'Crear un nuevo contrato',
      icon: <IconPlus className="h-5 w-5" />,
      route: '/contracts/new',
    },
    {
      title: 'Nuevo Suplemento',
      description: 'Añadir suplemento a contrato',
      icon: <IconClipboardList className="h-5 w-5" />,
      route: '/supplements/new',
    },
    {
      title: 'Nueva Empresa',
      description: 'Registrar empresa',
      icon: <IconBuildingStore className="h-5 w-5" />,
      route: '/companies/new',
    },
    {
      title: 'Nuevo Usuario',
      description: 'Registrar usuario',
      icon: <IconUser className="h-5 w-5" />,
      route: '/users/new',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Accesos directos a funcionalidades frecuentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-auto flex flex-col items-center justify-center gap-2 p-4 transition-all hover:border-primary"
              onClick={() => handleNavigate(action.route)}
            >
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                {action.icon}
              </div>
              <div className="text-center">
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 
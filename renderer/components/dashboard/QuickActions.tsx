import { Button } from "@/components/ui/button";
import { Plus, FileText, Upload, Settings, FileSearch, BarChart2 } from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null | undefined;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActions({ 
  actions: customActions, 
  className 
}: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    {
      id: 'new-contract',
      title: 'Nuevo Contrato',
      description: 'Crear un nuevo contrato desde cero',
      icon: FileText,
      href: '/contracts/new',
      variant: 'default',
    },
    {
      id: 'upload-document',
      title: 'Subir Documento',
      description: 'Cargar un documento existente',
      icon: Upload,
      href: '/documents/upload',
      variant: 'outline',
    },
    {
      id: 'view-reports',
      title: 'Ver Reportes',
      description: 'Generar o ver reportes',
      icon: BarChart2,
      href: '/reports',
      variant: 'outline',
    },
    {
      id: 'search-contracts',
      title: 'Buscar Contratos',
      description: 'Encontrar contratos existentes',
      icon: FileSearch,
      href: '/contracts',
      variant: 'outline',
    },
  ];

  const actions = customActions || defaultActions;

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  asChild
                  variant={action.variant}
                  className="h-auto py-3 px-4 flex flex-col items-start justify-start text-left"
                >
                  <a href={action.href} className="no-underline">
                    <div className="flex items-center mb-2">
                      <Icon className="h-5 w-5 mr-2" />
                      <span>{action.title}</span>
                    </div>
                    <p className="text-xs font-normal text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </a>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

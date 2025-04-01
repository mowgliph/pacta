import { 
  IconFileUpload, 
  IconSearch, 
  IconReport, 
  IconClockHour4,
  IconLock
} from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuickActionsPublicProps {
  onRequireAuth: () => void
}

export function QuickActionsPublic({ onRequireAuth }: QuickActionsPublicProps) {
  // Las acciones rápidas que se mostrarán en el panel público
  const quickActions = [
    {
      title: 'Subir contrato',
      description: 'Cargar un nuevo contrato al sistema',
      icon: <IconFileUpload className="h-5 w-5" />,
      action: onRequireAuth
    },
    {
      title: 'Buscar contrato',
      description: 'Buscar por nombre, cliente o fecha',
      icon: <IconSearch className="h-5 w-5" />,
      action: onRequireAuth
    },
    {
      title: 'Generar reporte',
      description: 'Crear informes personalizados',
      icon: <IconReport className="h-5 w-5" />,
      action: onRequireAuth
    },
    {
      title: 'Ver vencimientos',
      description: 'Contratos próximos a vencer',
      icon: <IconClockHour4 className="h-5 w-5" />,
      action: onRequireAuth
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Acciones rápidas</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
              <div className="rounded-full bg-primary/10 p-1 text-primary">
                {action.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 w-full justify-between"
                onClick={action.action}
              >
                <span>Requiere iniciar sesión</span>
                <IconLock className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
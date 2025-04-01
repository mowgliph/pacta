import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { IconCalendarEvent, IconFileDescription, IconUser, IconBuilding, IconLock } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface RecentActivityPublicProps {
  onRequireAuth: () => void
}

export function RecentActivityPublic({ onRequireAuth }: RecentActivityPublicProps) {
  // Datos simulados de actividad reciente
  const recentActivities = [
    {
      type: 'contract',
      title: 'Contrato de servicio',
      description: 'Actualizado por Juan Pérez',
      timestamp: 'Hace 2 horas',
      icon: <IconFileDescription className="h-5 w-5" />
    },
    {
      type: 'user',
      title: 'Nuevo usuario',
      description: 'María González se ha unido',
      timestamp: 'Hace 1 día',
      icon: <IconUser className="h-5 w-5" />
    },
    {
      type: 'event',
      title: 'Renovación programada',
      description: 'Contrato #45678',
      timestamp: 'En 3 días',
      icon: <IconCalendarEvent className="h-5 w-5" />
    },
    {
      type: 'company',
      title: 'Nueva empresa',
      description: 'Tecnología Innovadora S.A.',
      timestamp: 'Hace 5 días',
      icon: <IconBuilding className="h-5 w-5" />
    }
  ]

  // Función para obtener el color de fondo según el tipo de actividad
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 dark:bg-blue-900/20'
      case 'user':
        return 'bg-green-100 dark:bg-green-900/20'
      case 'event':
        return 'bg-amber-100 dark:bg-amber-900/20'
      case 'company':
        return 'bg-purple-100 dark:bg-purple-900/20'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  // Función para obtener el color del texto según el tipo de actividad
  const getActivityTextColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'text-blue-600 dark:text-blue-400'
      case 'user':
        return 'text-green-600 dark:text-green-400'
      case 'event':
        return 'text-amber-600 dark:text-amber-400'
      case 'company':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
        <CardDescription>Vista previa de la actividad del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className={cn('rounded-full p-2', getActivityBgColor(activity.type))}>
              <div className={getActivityTextColor(activity.type)}>
                {activity.icon}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={onRequireAuth}
        >
          <span>Ver historial completo</span>
          <IconLock className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
} 
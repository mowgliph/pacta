import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  IconRefresh, 
  IconArrowRight,
  IconLogin
} from '@tabler/icons-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStatsCards } from '../components/DashboardStatsCards'
import { DashboardChart } from '../components/DashboardChart'
import { QuickActionsPublic } from '../components/QuickActionsPublic'
import { RecentActivityPublic } from '../components/RecentActivityPublic'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { IconAlertCircle } from '@tabler/icons-react'

/**
 * Versión pública del dashboard que muestra estadísticas generales
 * y acciones rápidas que requieren inicio de sesión para ejecutarse
 */
export function DashboardPublicPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  // Datos simulados para el dashboard público
  const dashboardStats = {
    activeContracts: 124,
    pendingRenewals: 18,
    totalUsers: 56,
    alerts: 7,
    contractsStats: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      data: [10, 15, 8, 12, 20, 18]
    }
  }
  
  // Simular carga de datos
  const handleRefreshData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  // Dirigir al login cuando se requiera autenticación
  const handleRequireAuth = () => {
    navigate({ to: '/(auth)/login' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Principal PACTA"
        description="Gestión inteligente de contratos empresariales"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData}
              className="flex items-center gap-1"
              disabled={isLoading}
            >
              <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </Button>
            <Button 
              size="sm"
              onClick={handleRequireAuth}
              className="flex items-center gap-1"
            >
              <IconLogin className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </Button>
          </div>
        }
      />

      {/* Alerta de modo vista previa */}
      <Alert>
        <IconAlertCircle className="h-4 w-4" />
        <AlertTitle>Modo vista previa</AlertTitle>
        <AlertDescription>
          Estás viendo una versión limitada del panel. Para realizar acciones y ver información completa, 
          inicia sesión.
        </AlertDescription>
      </Alert>

      {/* Acciones Rápidas */}
      <QuickActionsPublic onRequireAuth={handleRequireAuth} />

      {/* Tarjetas de estadísticas */}
      <DashboardStatsCards 
        activeContracts={dashboardStats.activeContracts}
        pendingRenewals={dashboardStats.pendingRenewals}
        totalUsers={dashboardStats.totalUsers}
        alerts={dashboardStats.alerts}
        isLoading={isLoading}
        isPublic
      />

      {/* Gráfico de contratos */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        <DashboardChart 
          title="Contratos por mes"
          description="Evolución de contratos en los últimos meses"
          data={dashboardStats.contractsStats}
          isLoading={isLoading}
          isPublic
        />
      </div>

      {/* Sección de actividad reciente */}
      <div className="grid gap-4 md:grid-cols-1">
        <RecentActivityPublic onRequireAuth={handleRequireAuth} />
      </div>

      {/* Botón de inicio de sesión */}
      <Card>
        <CardHeader>
          <CardTitle>Accede a todas las funciones</CardTitle>
          <CardDescription>
            Inicia sesión para gestionar contratos, crear alertas y acceder a todas las funcionalidades.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleRequireAuth} className="flex items-center gap-2">
            Iniciar sesión <IconArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 
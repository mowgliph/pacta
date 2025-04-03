import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  RefreshCw,
  ArrowRight,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Versión pública del dashboard que muestra estadísticas generales
 * y acciones rápidas que requieren inicio de sesión para ejecutarse
 */
export default function PublicDashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
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
  };
  
  // Simular carga de datos
  const handleRefreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Dirigir al login cuando se requiera autenticación
  const handleLogin = () => {
    navigate('/auth/login');
  };

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
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </Button>
            <Button 
              size="sm"
              onClick={handleLogin}
              className="flex items-center gap-1"
            >
              <LogIn className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </Button>
          </div>
        }
      />

      {/* Alerta de modo vista previa */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Modo vista previa</AlertTitle>
        <AlertDescription>
          Estás viendo una versión limitada del panel. Para realizar acciones y ver información completa, 
          inicia sesión.
        </AlertDescription>
      </Alert>

      {/* Tarjetas de estadísticas (versión pública) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">Visibles públicamente</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renovaciones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingRenewals}</div>
            <p className="text-xs text-muted-foreground">En los próximos 30 días</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total registrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.alerts}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
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
          <Button onClick={handleLogin} className="flex items-center gap-2">
            Iniciar sesión <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardPublicPage } from '@/features/dashboard'

/**
 * Componente de Dashboard Público
 * Esta página es accesible sin autenticación y muestra una versión simplificada
 * del panel, con estadísticas y acciones rápidas que requerirán login para ejecutarse
 */
export function DashboardComponent() {
  return (
    <DashboardLayout isPublic>
      <DashboardPublicPage />
    </DashboardLayout>
  )
} 
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

/**
 * Ruta principal del dashboard que se carga por defecto cuando se navega a la ruta
 * autenticada raíz (/_authenticated/)
 */
export function AuthenticatedIndexComponent() {
  return <DashboardPage />
} 
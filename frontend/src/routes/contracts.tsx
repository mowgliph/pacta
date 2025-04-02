import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useStore } from '@/store'
import { ContractsLayout } from '@/features/contracts/layouts/ContractsLayout'

/**
 * Ruta principal para la sección de contratos
 */
export const Route = createFileRoute('/contracts')({
  component: () => (
    <ContractsLayout>
      <Outlet />
    </ContractsLayout>
  ),
  beforeLoad: () => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = useStore.getState().isAuthenticated
    const token = useStore.getState().token
    
    // Redirigir al login si no está autenticado
    if (!isAuthenticated && !token) {
      throw redirect({
        to: '/login',
        replace: true
      })
    }
    
    return null
  }
}) 
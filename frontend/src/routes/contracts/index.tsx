import { createFileRoute } from '@tanstack/react-router'
import { ContractsListPage } from '@/features/contracts'

/**
 * Ruta para la lista de contratos
 */
export const Route = createFileRoute('/contracts/')({
  component: ContractsListPage
}) 
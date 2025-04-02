import { createFileRoute } from '@tanstack/react-router'
import { ContractCreatePage } from '@/features/contracts'

/**
 * Ruta para crear nuevos contratos
 */
export const Route = createFileRoute('/contracts/create')({
  component: ContractCreatePage
}) 
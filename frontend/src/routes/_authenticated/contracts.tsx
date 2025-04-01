import { createFileRoute } from "@tanstack/react-router";
import { ContractsLayout } from "@/features/contracts/layouts/ContractsLayout";

/**
 * Ruta para la sección de contratos en la aplicación
 */
export const Route = createFileRoute("/_authenticated/contracts")({
  component: ContractsLayout,
})

/**
 * Ruta para listar contratos
 */
export const ContractsComponent = ContractsListPage 
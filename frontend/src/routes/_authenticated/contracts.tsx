import { createFileRoute } from "@tanstack/react-router";
import { ContractsLayout } from "@/features/contracts/layouts/ContractsLayout";
 
// Definición de ruta para la sección de contratos
export const Route = createFileRoute("/_authenticated/contracts")({
  component: ContractsLayout,
}); 
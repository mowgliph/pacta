import { createFileRoute } from "@tanstack/react-router";
import { ContractCreatePage } from "@/features/contracts";

/**
 * Ruta para crear un nuevo contrato
 */
export const Route = createFileRoute("/_authenticated/contracts/create")({
  component: ContractCreatePage,
}); 
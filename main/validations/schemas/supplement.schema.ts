import { z } from "zod";

export const SupplementSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "El título no puede exceder los 100 caracteres"),
  description: z.string().max(1000, "La descripción no puede exceder los 1000 caracteres").optional(),
  changes: z.string().min(1, "Debe especificar los cambios realizados").max(5000, "Los cambios no pueden exceder los 5000 caracteres"),
  effectiveDate: z.date({ required_error: "La fecha efectiva es requerida" }),
  contractId: z.string().uuid("El ID del contrato debe ser un UUID válido"),
  isApproved: z.boolean().optional(),
  approvedById: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
  createdById: z.string().uuid({ message: "El ID del creador es requerido" }),
});

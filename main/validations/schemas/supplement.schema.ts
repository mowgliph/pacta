import { z } from "zod";

export const CHANGE_TYPES = [
  "extension",
  "modification",
  "termination",
  "price_adjustment",
  "scope_change",
  "force_majeure",
] as const;

export const documentSchema = z.object({
  name: z.string().min(1, "El nombre del documento es requerido"),
  type: z.string().min(1, "El tipo de documento es requerido"),
  description: z.string().optional(),
  file: z.instanceof(File).optional(),
  url: z.string().url().optional(),
});

export const SupplementSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(100, "El título no puede exceder los 100 caracteres"),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(1000, "La descripción no puede exceder los 1000 caracteres"),
  changeType: z.enum(CHANGE_TYPES, {
    required_error: "El tipo de cambio es requerido",
  }),
  changes: z
    .string()
    .min(1, "Debe especificar los cambios realizados")
    .max(5000, "Los cambios no pueden exceder los 5000 caracteres"),
  effectiveDate: z
    .date({
      required_error: "La fecha efectiva es requerida",
    })
    .refine((date) => date >= new Date(), {
      message: "La fecha efectiva debe ser futura",
    }),
  contractId: z.string().uuid("El ID del contrato debe ser un UUID válido"),
  documents: z.array(documentSchema).optional(),
  metadata: z.record(z.any()).optional(),
  isApproved: z.boolean().default(false),
  approvedById: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
});

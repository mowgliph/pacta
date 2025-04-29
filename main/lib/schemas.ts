import { z } from "zod";

// Esquema para validación de suplementos
export const supplementSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  changeType: z.enum(
    [
      "extension",
      "modification",
      "termination",
      "price_adjustment",
      "scope_change",
      "force_majeure",
    ],
    {
      required_error: "Debe seleccionar el tipo de cambio",
    }
  ),
  changes: z.string().min(1, "Debe especificar los cambios"),
  effectiveDate: z.date({
    required_error: "La fecha efectiva es obligatoria",
  }),
  documents: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        file: z.any().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  metadata: z.record(z.any()).optional(),
  isApproved: z.boolean().default(false),
  approvedById: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
  documentUrl: z.string().optional(),
});

import * as z from "zod";

export const supplementSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(100, "El título no puede exceder los 100 caracteres"),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(1000, "La descripción no puede exceder los 1000 caracteres"),
  effectiveDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
  contractId: z.string().uuid("El ID del contrato debe ser un UUID válido"),
  documents: z
    .array(
      z.object({
        name: z.string().min(1, "El nombre del documento es requerido"),
        file: z.instanceof(File).optional(),
        url: z.string().url().optional(),
      })
    )
    .optional(),
});

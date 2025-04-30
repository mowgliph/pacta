import { z } from "zod";

export const DocumentSchema = z.object({
  name: z.string().min(1, "El nombre del documento es requerido"),
  type: z.string().min(1, "El tipo de documento es requerido"),
  description: z.string().optional(),
  file: z.any().optional(),
  documentUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
  uploadedById: z.string().uuid(),
});

import { z } from 'zod';

export const contractSchema = z.object({
  contractNumber: z.string().min(1, "El número de contrato es requerido"),
  type: z.enum(["Cliente", "Proveedor"], {
    required_error: "El tipo de contrato es requerido",
  }),
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  legalRepresentativeId: z.string().optional().nullable(),
  startDate: z.string().or(z.date()).transform(val => new Date(val)),
  endDate: z.string().or(z.date()).transform(val => new Date(val)),
  description: z.string().optional(),
  status: z.enum(["ACTIVO", "VENCIDO"]).default("ACTIVO"),
  isArchived: z.boolean().default(false),
  ownerId: z.string().optional(),
  createdById: z.string().optional()
}).refine((data) => data.endDate > data.startDate, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDate"]
});

export type ContractFormValues = z.infer<typeof contractSchema>;

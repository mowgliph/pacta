import { z } from "zod";

// Esquema para el representante legal
export const legalRepresentativeSchema = z.object({
  name: z.string().min(1, "El nombre del representante legal es requerido"),
  position: z.string().min(1, "El cargo del representante legal es requerido"),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  documentDate: z.string().or(z.date()).optional(),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("Correo electrónico de la empresa inválido").optional().or(z.literal("")),
  document: z.instanceof(File).optional(),
  documentDescription: z.string().optional()
});

export type LegalRepresentativeValues = z.infer<typeof legalRepresentativeSchema>;

export const contractSchema = z
  .object({
    contractNumber: z.string().min(1, "El número de contrato es requerido"),
    type: z.enum(["Cliente", "Proveedor"], {
      required_error: "El tipo de contrato es requerido",
    }),
    companyName: z.string().min(1, "El nombre de la empresa es requerido"),
    legalRepresentative: legalRepresentativeSchema.optional(),
    legalRepresentativeId: z.string().optional().nullable(),
    startDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    endDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    description: z.string().optional(),
    status: z.enum(["ACTIVO", "VENCIDO"]).default("ACTIVO"),
    isArchived: z.boolean().default(false),
    ownerId: z.string().optional(),
    createdById: z.string().optional(),
    document: z.instanceof(File).optional(),
    documentUrl: z.string().optional(),
    representativeDocumentUrl: z.string().optional(),
    documentType: z.string().optional(),
    documentDescription: z.string().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  });

export type ContractFormValues = z.infer<typeof contractSchema>;

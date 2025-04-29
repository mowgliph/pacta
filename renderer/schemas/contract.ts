import { z } from "zod";

// Tipos de contrato permitidos
export const CONTRACT_TYPES = ["Cliente", "Proveedor"] as const;

// Tipos de estado permitidos
export const CONTRACT_STATUSES = [
  "Vigente",
  "Próximo a Vencer",
  "Vencido",
  "Archivado",
] as const;

// Tipos de moneda permitidos
export const CURRENCY_TYPES = ["CUP", "MLC"] as const;

// Esquemas base
export const bankDetailsSchema = z.object({
  account: z.string().min(1, "La cuenta bancaria es obligatoria"),
  branch: z.string().min(1, "La sucursal bancaria es obligatoria"),
  agency: z.string().min(1, "La agencia bancaria es obligatoria"),
  holder: z.string().min(1, "El titular de la cuenta es obligatorio"),
  currency: z.enum(CURRENCY_TYPES, {
    required_error: "La moneda es obligatoria",
  }),
});

export const legalRepresentativeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  position: z.string().min(1, "El cargo es obligatorio"),
  documentType: z.string().min(1, "El tipo de documento es obligatorio"),
  documentNumber: z.string().min(1, "El número de documento es obligatorio"),
  documentDate: z.date({
    required_error: "La fecha del documento es obligatoria",
  }),
});

export const attachmentSchema = z.object({
  type: z.string().min(1, "El tipo de documento es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  documentUrl: z.string().url().optional(),
  file: z.instanceof(File).optional(),
});

// Esquema principal de contrato
export const contractSchema = z.object({
  // Datos básicos
  contractNumber: z.string().min(1, "El número de contrato es obligatorio"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(CONTRACT_TYPES, {
    required_error: "El tipo de contrato es obligatorio",
  }),
  status: z.enum(CONTRACT_STATUSES, {
    required_error: "El estado del contrato es obligatorio",
  }),

  // Fechas
  signDate: z.date({
    required_error: "La fecha de firma es obligatoria",
  }),
  startDate: z.date({
    required_error: "La fecha de inicio es obligatoria",
  }),
  endDate: z
    .date({
      required_error: "La fecha de fin es obligatoria",
    })
    .refine((date) => date > new Date(), {
      message: "La fecha de fin debe ser futura",
    }),

  // Información de la empresa
  companyName: z.string().min(1, "El nombre de la empresa es obligatorio"),
  companyAddress: z.string().min(1, "La dirección es obligatoria"),
  nationality: z.string().min(1, "La nacionalidad es obligatoria"),
  commercialAuth: z.string().min(1, "La autorización comercial es obligatoria"),
  reeupCode: z.string().min(1, "El código REEUP es obligatorio"),
  nit: z.string().min(1, "El NIT es obligatorio"),
  contactPhones: z.array(z.string().min(1, "El teléfono es obligatorio")),

  // Detalles bancarios
  bankDetails: bankDetailsSchema,

  // Representante legal
  legalRepresentative: legalRepresentativeSchema,

  // Obligaciones
  providerObligations: z.array(
    z.string().min(1, "La obligación es obligatoria")
  ),
  clientObligations: z.array(z.string().min(1, "La obligación es obligatoria")),

  // Entrega y aceptación
  deliveryPlace: z.string().min(1, "El lugar de entrega es obligatorio"),
  deliveryTerm: z.string().min(1, "El plazo de entrega es obligatorio"),
  acceptanceProcedure: z
    .string()
    .min(1, "El procedimiento de aceptación es obligatorio"),

  // Condiciones económicas
  value: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  currency: z.enum(CURRENCY_TYPES, {
    required_error: "La moneda es obligatoria",
  }),
  paymentMethod: z.string().min(1, "La forma de pago es obligatoria"),
  paymentTerm: z.string().min(1, "El plazo de pago es obligatorio"),

  // Garantía y calidad
  warrantyTerm: z.string().min(1, "El plazo de garantía es obligatorio"),
  warrantyScope: z.string().min(1, "El alcance de la garantía es obligatorio"),
  technicalStandards: z.string().optional(),

  // Reclamaciones y conflictos
  claimProcedure: z
    .string()
    .min(1, "El procedimiento de reclamación es obligatorio"),
  disputeResolution: z
    .string()
    .min(1, "La resolución de disputas es obligatoria"),
  latePaymentInterest: z.string().min(1, "El interés por mora es obligatorio"),
  breachPenalties: z.string().min(1, "Las penalidades son obligatorias"),

  // Notificaciones
  notificationMethods: z.array(
    z.string().min(1, "El método de notificación es obligatorio")
  ),
  minimumNoticeTime: z
    .string()
    .min(1, "El tiempo mínimo de aviso es obligatorio"),

  // Términos
  extensionTerms: z
    .string()
    .min(1, "Los términos de extensión son obligatorios"),
  earlyTerminationNotice: z
    .string()
    .min(1, "El aviso de terminación anticipada es obligatorio"),
  forceMajeure: z.string().min(1, "La cláusula de fuerza mayor es obligatoria"),

  // Documentos
  attachments: z.array(attachmentSchema).optional(),

  // Metadatos del sistema
  isRestricted: z.boolean().default(false),
  createdById: z.string().uuid(),
  ownerId: z.string().uuid(),
});

// Tipos derivados
export type Contract = z.infer<typeof contractSchema>;
export type BankDetails = z.infer<typeof bankDetailsSchema>;
export type LegalRepresentative = z.infer<typeof legalRepresentativeSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type ContractType = (typeof CONTRACT_TYPES)[number];
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
export type CurrencyType = (typeof CURRENCY_TYPES)[number];

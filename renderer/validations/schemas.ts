import { z } from "zod";

// Schema para login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Schema para cambio de contraseña
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Schema para contrato
export const contractSchema = z.object({
  // Encabezado
  contractNumber: z.string().min(1, "Número de contrato requerido"),
  signDate: z.string().min(1, "Fecha de firma requerida"),
  signPlace: z.string().min(1, "Lugar de firma requerido"),

  // Identificación de las Partes
  type: z.string().refine((val) => ["Cliente", "Proveedor"].includes(val), {
    message: "Tipo debe ser Cliente o Proveedor",
  }),
  companyName: z.string().min(1, "Razón social requerida"),
  companyAddress: z.string().min(1, "Domicilio legal requerido"),
  nationality: z.string().min(1, "Nacionalidad requerida"),
  commercialAuth: z.string().min(1, "Autorización Comercial (MN) requerida"),
  bankDetails: z.object({
    account: z.string().min(1, "Cuenta bancaria requerida"),
    branch: z.string().min(1, "Sucursal requerida"),
    agency: z.string().min(1, "Agencia requerida"),
    holder: z.string().min(1, "Titular requerido"),
    currency: z.string().refine((val) => ["CUP", "MLC"].includes(val), {
      message: "Moneda debe ser CUP o MLC",
    }),
  }),
  reeupCode: z.string().min(1, "Código REEUP requerido"),
  nit: z.string().min(1, "NIT requerido"),
  contactPhones: z
    .array(z.string())
    .min(1, "Al menos un teléfono de contacto requerido"),
  legalRepresentative: z.object({
    name: z.string().min(1, "Nombre del representante legal requerido"),
    position: z.string().min(1, "Cargo del representante legal requerido"),
    documentType: z
      .string()
      .min(1, "Tipo de documento de representación requerido"),
    documentNumber: z.string().min(1, "Número de documento requerido"),
    documentDate: z.string().min(1, "Fecha de documento requerida"),
  }),

  // Objeto del Contrato
  description: z.string().min(1, "Descripción del servicio/producto requerida"),

  // Obligaciones
  providerObligations: z
    .array(z.string())
    .min(1, "Al menos una obligación del prestador requerida"),
  clientObligations: z
    .array(z.string())
    .min(1, "Al menos una obligación del cliente requerida"),

  // Lugar, plazos y condiciones de entrega
  deliveryPlace: z.string().min(1, "Lugar de entrega requerido"),
  deliveryTerm: z.string().min(1, "Plazo de entrega requerido"),
  acceptanceProcedure: z
    .string()
    .min(1, "Procedimiento de aceptación requerido"),

  // Condiciones económicas
  value: z.number().min(0, "Valor total requerido"),
  currency: z.enum(["MN", "MLC"], { required_error: "Moneda requerida" }),
  paymentMethod: z.string().min(1, "Forma de pago requerida"),
  paymentTerm: z.string().min(1, "Plazo de pago requerido"),

  // Garantía y calidad
  warrantyTerm: z.string().min(1, "Plazo de garantía requerido"),
  warrantyScope: z.string().min(1, "Alcance de garantía requerido"),
  technicalStandards: z.string().optional(),

  // Reclamaciones y solución de conflictos
  claimProcedure: z.string().min(1, "Procedimiento de reclamación requerido"),
  disputeResolution: z.string().min(1, "Resolución de conflictos requerida"),

  // Penalidades
  latePaymentInterest: z.string().min(1, "Intereses por mora requeridos"),
  breachPenalties: z.string().min(1, "Sanciones por incumplimiento requeridas"),

  // Avisos
  notificationMethods: z
    .array(z.string())
    .min(1, "Al menos un método de notificación requerido"),
  minimumNoticeTime: z.string().min(1, "Plazo mínimo de aviso requerido"),

  // Duración y terminación
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  extensionTerms: z.string().min(1, "Términos de prórroga requeridos"),
  earlyTerminationNotice: z.string().min(1, "Plazo de preaviso requerido"),

  // Causas eximentes
  forceMajeure: z.string().min(1, "Definición de fuerza mayor requerida"),

  // Anexos
  attachments: z
    .array(
      z.object({
        type: z.string().min(1, "Tipo de anexo requerido"),
        description: z.string().min(1, "Descripción del anexo requerida"),
        documentUrl: z.string().optional(),
        file: z.any().optional(),
      })
    )
    .min(1, "Al menos un anexo requerido"),

  // Estado y control
  status: z
    .enum(["Vigente", "Próximo a Vencer", "Vencido", "Archivado"])
    .default("Vigente"),
  isRestricted: z.boolean().default(false),
  createdById: z.string().uuid(),
  ownerId: z.string().uuid(),
});

// Schema para usuario
export const userSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Contraseña debe tener al menos 8 caracteres"),
  roleId: z.string().uuid("ID de rol inválido"),
  customPermissions: z.record(z.boolean()).optional(),
});

const { z } = require("zod");

exports.CONTRACT_TYPES = ["Cliente", "Proveedor"];
exports.CONTRACT_STATUSES = [
  "Vigente",
  "Próximo a Vencer",
  "Vencido",
  "Archivado",
];
exports.CURRENCY_TYPES = ["CUP", "MLC"];

exports.bankDetailsSchema = z.object({
  account: z.string().min(1, "La cuenta bancaria es obligatoria"),
  branch: z.string().min(1, "La sucursal bancaria es obligatoria"),
  agency: z.string().min(1, "La agencia bancaria es obligatoria"),
  holder: z.string().min(1, "El titular de la cuenta es obligatorio"),
  currency: z.enum(exports.CURRENCY_TYPES, {
    required_error: "La moneda es obligatoria",
  }),
});

exports.legalRepresentativeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  position: z.string().min(1, "El cargo es obligatorio"),
  documentType: z.string().min(1, "El tipo de documento es obligatorio"),
  documentNumber: z.string().min(1, "El número de documento es obligatorio"),
  documentDate: z.date({
    required_error: "La fecha del documento es obligatoria",
  }),
});

exports.attachmentSchema = z.object({
  type: z.string().min(1, "El tipo de documento es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  documentUrl: z.string().url().optional(),
  file: z.instanceof(File).optional(),
});

exports.ContractSchema = z.object({
  contractNumber: z.string().min(1, "El número de contrato es obligatorio"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(exports.CONTRACT_TYPES, {
    required_error: "El tipo de contrato es obligatorio",
  }),
  status: z.enum(exports.CONTRACT_STATUSES, {
    required_error: "El estado del contrato es obligatorio",
  }),
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
  companyName: z.string().min(1, "El nombre de la empresa es obligatorio"),
  companyAddress: z.string().min(1, "La dirección es obligatoria"),
  nationality: z.string().min(1, "La nacionalidad es obligatoria"),
  commercialAuth: z.string().min(1, "La autorización comercial es obligatoria"),
  reeupCode: z.string().min(1, "El código REEUP es obligatorio"),
  nit: z.string().min(1, "El NIT es obligatorio"),
  contactPhones: z.array(z.string().min(1, "El teléfono es obligatorio")),
  bankDetails: exports.bankDetailsSchema,
  legalRepresentative: exports.legalRepresentativeSchema,
  providerObligations: z.array(
    z.string().min(1, "La obligación es obligatoria")
  ),
  clientObligations: z.array(z.string().min(1, "La obligación es obligatoria")),
  deliveryPlace: z.string().min(1, "El lugar de entrega es obligatorio"),
  deliveryTerm: z.string().min(1, "El plazo de entrega es obligatorio"),
  acceptanceProcedure: z
    .string()
    .min(1, "El procedimiento de aceptación es obligatorio"),
  value: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  currency: z.enum(exports.CURRENCY_TYPES, {
    required_error: "La moneda es obligatoria",
  }),
  paymentMethod: z.string().min(1, "La forma de pago es obligatoria"),
  paymentTerm: z.string().min(1, "El plazo de pago es obligatorio"),
  warrantyTerm: z.string().min(1, "El plazo de garantía es obligatorio"),
  warrantyScope: z.string().min(1, "El alcance de la garantía es obligatorio"),
  technicalStandards: z.string().optional(),
  claimProcedure: z
    .string()
    .min(1, "El procedimiento de reclamación es obligatorio"),
  disputeResolution: z
    .string()
    .min(1, "La resolución de disputas es obligatoria"),
  latePaymentInterest: z.string().min(1, "El interés por mora es obligatorio"),
  breachPenalties: z.string().min(1, "Las penalidades son obligatorias"),
  notificationMethods: z.array(
    z.string().min(1, "El método de notificación es obligatorio")
  ),
  minimumNoticeTime: z
    .string()
    .min(1, "El tiempo mínimo de aviso es obligatorio"),
  extensionTerms: z
    .string()
    .min(1, "Los términos de extensión son obligatorios"),
  earlyTerminationNotice: z
    .string()
    .min(1, "El aviso de terminación anticipada es obligatorio"),
  forceMajeure: z.string().min(1, "La cláusula de fuerza mayor es obligatoria"),
  attachments: z.array(exports.attachmentSchema).optional(),
  isRestricted: z.boolean().default(false),
  createdById: z.string().uuid(),
  ownerId: z.string().uuid(),
});

import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Schema para contrato
export const contractSchema = z.object({
  contractNumber: z.string().min(1, 'Número de contrato requerido'),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  parties: z.string().min(1, 'Partes involucradas requeridas'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().optional(),
  value: z.string().optional(),
  type: z.string().refine(val => ['Cliente', 'Proveedor'].includes(val), {
    message: 'Tipo debe ser Cliente o Proveedor',
  }),
  companyName: z.string().min(1, 'Razón social requerida'),
  companyAddress: z.string().optional(),
  signDate: z.string().min(1, 'Fecha de firma requerida'),
  signPlace: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentTerm: z.string().optional(),
});

// Schema para suplemento
export const supplementSchema = z.object({
  contractId: z.string().uuid('ID de contrato inválido'),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  documentUrl: z.string().optional(),
  changes: z.record(z.any()).refine(val => Object.keys(val).length > 0, {
    message: 'Debe especificar al menos un cambio',
  }),
  effectiveDate: z.string().min(1, 'Fecha efectiva requerida'),
});

// Schema para usuario
export const userSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  roleId: z.string().uuid('ID de rol inválido'),
  customPermissions: z.record(z.boolean()).optional(),
});
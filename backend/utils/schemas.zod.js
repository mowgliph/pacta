import { z } from 'zod';

// --- User Schemas ---

// Schema base para los campos comunes del usuario
const userBaseSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres.'),
  email: z.string().email('Email inválido.'),
  role: z.enum(['User', 'Admin', 'RA']).default('User'),
  notifications: z.boolean().default(true),
});

// Schema para crear un usuario (requiere contraseña)
export const createUserSchema = userBaseSchema.extend({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

// Schema para actualizar el perfil (contraseña opcional)
export const updateUserProfileSchema = z.object({
  email: z.string().email('Email inválido.').optional(),
  notifications: z.boolean().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional(),
  // No permitir actualizar username o role desde aquí
});

// --- Contract Schemas ---

// Schema base para los campos del contrato
const contractBaseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  type: z.string().optional(), // Campo tipo añadido
  description: z.string().optional(),
  startDate: z.coerce.date({ message: 'Fecha de inicio inválida.' }), // coerce convierte string a Date
  endDate: z.coerce.date({ message: 'Fecha de vencimiento inválida.' }),
  status: z.enum(['Active', 'Expired', 'Pending', 'Terminated']).default('Active'),
  // documentPath vendrá del middleware de subida o se manejará por separado
  // userId se añadirá desde req.user.id
  // companyId, departmentId son opcionales, podrían validarse como números si se envían
  companyId: z.number().int().positive().optional(),
  departmentId: z.number().int().positive().optional(),
});

// Schema para crear un contrato (podría ser igual al base si userId se añade aparte)
export const createContractSchema = contractBaseSchema;

// Schema para actualizar un contrato (todos los campos opcionales)
export const updateContractSchema = contractBaseSchema.partial(); // .partial() hace todos los campos opcionales

// --- Supplement Schemas ---

const supplementBaseSchema = z.object({
    description: z.string().min(1, 'La descripción es requerida.'),
    // filePath se manejará por separado o vendrá del middleware
});

export const createSupplementSchema = supplementBaseSchema;
export const updateSupplementSchema = supplementBaseSchema.partial();

// --- Login Schema ---
export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
}); 
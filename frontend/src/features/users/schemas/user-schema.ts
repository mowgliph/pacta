import { z } from 'zod';
import { UserRole, UserStatus } from '../types';

export const userSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

  lastName: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(50, 'Los apellidos no pueden exceder los 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Los apellidos solo pueden contener letras'),

  email: z
    .string()
    .email('Correo electrónico inválido')
    .min(5, 'El correo electrónico es demasiado corto')
    .max(100, 'El correo electrónico es demasiado largo')
    .regex(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      'Formato de correo electrónico inválido'
    ),

  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ 
      message: 'Seleccione un rol válido (RA, ADMIN, MANAGER, USER, VIEWER)' 
    }),
    required_error: 'El rol es obligatorio'
  }),

  status: z.nativeEnum(UserStatus, {
    errorMap: () => ({ 
      message: 'Seleccione un estado válido' 
    }),
    required_error: 'El estado es obligatorio'
  }),

  department: z
    .string()
    .min(2, 'El departamento debe tener al menos 2 caracteres')
    .max(50, 'El departamento no puede exceder los 50 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s-_]+$/,
      'El nombre del departamento contiene caracteres inválidos'
    )
    .optional(),

  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Número de teléfono inválido (formato internacional: +[código país][número], ejemplo: +34612345678)'
    )
    .optional(),

  notificationPreferences: z.object({
    email: z.boolean().default(true),
    system: z.boolean().default(true),
    contractExpiration: z.boolean().default(true),
    contractUpdates: z.boolean().default(true)
  }).optional(),

  accessLevel: z.object({
    canCreateContracts: z.boolean().optional(),
    canEditContracts: z.boolean().optional(),
    canDeleteContracts: z.boolean().optional(),
    canManageUsers: z.boolean().optional()
  }).optional()
});

export type UserFormData = z.infer<typeof userSchema>;
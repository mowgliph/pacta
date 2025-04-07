/**
 * Validadores para las rutas de usuarios
 */
import { z } from 'zod';
import { ValidationError } from '../../utils/errors.js';

// Esquemas de validación
const userCreateSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo inválida' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres' }),
  role: z.enum(['ADMIN', 'RA', 'MANAGER', 'USER', 'VIEWER'], {
    message: 'Rol inválido',
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  departmentId: z.string().uuid().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

const userUpdateSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo inválida' }).optional(),
  firstName: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .optional(),
  lastName: z
    .string()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    .optional(),
  role: z
    .enum(['ADMIN', 'RA', 'MANAGER', 'USER', 'VIEWER'], {
      message: 'Rol inválido',
    })
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
});

const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'Contraseña actual requerida' }),
    newPassword: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    confirmPassword: z.string().min(8, { message: 'La confirmación de contraseña es requerida' }),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: 'Token requerido' }),
    newPassword: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    confirmPassword: z.string().min(8, { message: 'La confirmación de contraseña es requerida' }),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

const userRoleUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'RA', 'MANAGER', 'USER', 'VIEWER'], {
    message: 'Rol inválido',
  }),
});

const userStatusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
    message: 'Estado inválido',
  }),
});

// Middleware de validación
export const validateUser = (req, res, next) => {
  try {
    req.body = userCreateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Datos de usuario inválidos', error.flatten().fieldErrors));
    } else {
      next(error);
    }
  }
};

export const validateUserUpdate = (req, res, next) => {
  try {
    req.body = userUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Datos de actualización inválidos', error.flatten().fieldErrors));
    } else {
      next(error);
    }
  }
};

export const validatePasswordChange = (req, res, next) => {
  try {
    req.body = passwordChangeSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(
        new ValidationError('Datos de cambio de contraseña inválidos', error.flatten().fieldErrors),
      );
    } else {
      next(error);
    }
  }
};

export const validateResetPassword = (req, res, next) => {
  try {
    req.body = resetPasswordSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(
        new ValidationError(
          'Datos de restablecimiento de contraseña inválidos',
          error.flatten().fieldErrors,
        ),
      );
    } else {
      next(error);
    }
  }
};

export const validateUserRoleUpdate = (req, res, next) => {
  try {
    req.body = userRoleUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Rol inválido', error.flatten().fieldErrors));
    } else {
      next(error);
    }
  }
};

export const validateUserStatusUpdate = (req, res, next) => {
  try {
    req.body = userStatusUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Estado inválido', error.flatten().fieldErrors));
    } else {
      next(error);
    }
  }
};

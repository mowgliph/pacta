import { z } from 'zod';

// Login schema
export const loginSchema = () => {
  return z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    rememberMe: z.boolean().optional(),
  });
};

// Registration schema
export const registrationSchema = () => {
  return z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine(val => val === true, {
      message: 'Debe aceptar los términos y condiciones',
    }),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
};

// Password reset request schema
export const passwordResetRequestSchema = () => {
  return z.object({
    email: z.string().email('Email inválido'),
  });
};

// Password reset schema
export const passwordResetSchema = () => {
  return z.object({
    token: z.string().min(1, 'El token es requerido'),
    newPassword: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
};

// Email verification schema
export const emailVerificationSchema = () => {
  return z.object({
    token: z.string().min(1, 'El token es requerido'),
  });
};

// Change password schema
export const changePasswordSchema = () => {
  return z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
};

// Refresh token schema
export const refreshTokenSchema = () => {
  return z.object({
    refreshToken: z.string().min(1, 'El token de actualización es requerido'),
  });
};

// Two factor authentication setup schema
export const twoFactorSetupSchema = () => {
  return z.object({
    enable: z.boolean(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional(),
    method: z.enum(['SMS', 'EMAIL', 'APP']).optional(),
  }).refine(
    data => {
      if (data.enable) {
        if (data.method === 'SMS' && !data.phone) {
          return false;
        }
        if (data.method === 'EMAIL' && !data.email) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Si el método es SMS se requiere un número de teléfono, si es EMAIL se requiere un correo',
      path: ['method'],
    }
  );
};

// Two factor authentication verify schema
export const twoFactorVerifySchema = () => {
  return z.object({
    code: z.string().min(4, 'El código debe tener al menos 4 caracteres'),
    method: z.enum(['SMS', 'EMAIL', 'APP']),
  });
};

// OAuth login schema
export const oauthLoginSchema = () => {
  return z.object({
    provider: z.enum(['GOOGLE', 'MICROSOFT', 'FACEBOOK', 'APPLE']),
    accessToken: z.string().min(1, 'El token de acceso es requerido'),
    refreshToken: z.string().optional(),
    idToken: z.string().optional(),
  });
};

// Export all schemas for ValidationService
export const authValidators = {
  loginSchema,
  registrationSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailVerificationSchema,
  changePasswordSchema,
  refreshTokenSchema,
  twoFactorSetupSchema,
  twoFactorVerifySchema,
  oauthLoginSchema
}; 
import { z } from 'zod';

// Login schema
export const loginSchema = () => {
  return z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    rememberMe: z.boolean().optional(),
  });
};

// Verify token schema
export const verifyTokenSchema = () => {
  return z.object({
    token: z.string().min(1, 'El token es requerido'),
  });
};

// Refresh token schema
export const refreshTokenSchema = () => {
  return z.object({
    refreshToken: z.string().min(1, 'El token de actualización es requerido'),
  });
};

// Export all schemas for ValidationService
export const authValidators = {
  loginSchema,
  verifyTokenSchema,
  refreshTokenSchema,
};

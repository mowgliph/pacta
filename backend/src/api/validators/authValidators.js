import { z } from 'zod';

// Login schema
export const loginSchema = () => {
  return z.object({
    username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    password: z.string().min(1, 'La contraseña es requerida'),
    rememberMe: z.boolean().optional().default(false),
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

// Export all schemas as a single object for ValidationService
export const auth = {
  loginSchema,
  verifyTokenSchema,
  refreshTokenSchema,
};

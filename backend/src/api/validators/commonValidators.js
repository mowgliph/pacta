import { z } from 'zod';

/**
 * Validadores comunes reutilizables en toda la aplicación
 */
export const commonValidators = {
  // Validador para IDs (UUID o entero positivo)
  id: z.union([
    z.string().uuid('ID debe ser un UUID válido'),
    z.coerce.number().int().positive('ID debe ser un número entero positivo'),
  ]),

  // Validador para fechas
  date: z.union([z.string().datetime({ offset: true }), z.date()]),

  // Validador para precios
  price: z
    .number()
    .nonnegative('El precio no puede ser negativo')
    .multipleOf(0.01, 'El precio debe tener máximo 2 decimales'),

  // Validador para porcentajes
  percentage: z
    .number()
    .min(0, 'El porcentaje no puede ser menor a 0')
    .max(100, 'El porcentaje no puede ser mayor a 100'),

  // Validador para correos electrónicos
  email: z.string().email('Email inválido'),

  // Validador para URLs
  url: z.string().url('URL inválida'),

  // Validador para teléfonos
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Número de teléfono inválido'),

  // Validador para DNI/NIF español
  dni: z.string().regex(/^[0-9]{8}[A-Z]$/, 'DNI/NIF inválido'),

  // Validador para código postal español
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Código postal inválido'),

  // Validador para nombres (personas, empresas, etc.)
  name: z
    .string()
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(100, 'No puede exceder 100 caracteres'),

  // Validador para texto corto
  shortText: z.string().max(255, 'No puede exceder 255 caracteres'),

  // Validador para texto largo
  longText: z.string().max(5000, 'No puede exceder 5000 caracteres'),

  // Validador para paginación
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),

  // Validador para ordenamiento
  sorting: z.object({
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),

  // Regex comunes
  regex: {
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    passwordMessage:
      'Debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',

    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    uuidMessage: 'Debe ser un UUID válido',

    alpha: /^[a-zA-Z]+$/,
    alphaMessage: 'Solo debe contener letras',

    alphanumeric: /^[a-zA-Z0-9]+$/,
    alphanumericMessage: 'Solo debe contener letras y números',

    numeric: /^[0-9]+$/,
    numericMessage: 'Solo debe contener números',
  },
};

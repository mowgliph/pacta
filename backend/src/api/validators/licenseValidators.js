import { z } from 'zod';

// Base license schema
const licenseBaseSchema = z.object({
  licenseKey: z.string().min(10, 'La clave de licencia debe tener al menos 10 caracteres'),
  type: z.enum(['DEMO', 'TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  expiryDate: z.string().datetime('Fecha de expiración inválida'),
  maxUsers: z.number().int().positive('El número de usuarios debe ser positivo'),
  maxContracts: z.number().int().nonnegative('El número de contratos no puede ser negativo'),
  features: z.array(z.string()).optional(),
  active: z.boolean().default(true),
  notes: z.string().optional(),
  customerId: z.string().uuid('ID de cliente inválido').optional(),
  contactEmail: z.string().email('Email inválido').optional(),
  metadata: z.record(z.unknown()).optional(),
});

// License creation schema
export const createLicenseSchema = () => {
  return licenseBaseSchema.refine(data => new Date(data.startDate) < new Date(data.expiryDate), {
    message: 'La fecha de inicio debe ser anterior a la fecha de expiración',
    path: ['expiryDate'],
  });
};

// License update schema
export const updateLicenseSchema = () => {
  return licenseBaseSchema.partial().refine(
    data => {
      // Solo validar si ambas fechas están presentes
      if (data.startDate && data.expiryDate) {
        return new Date(data.startDate) < new Date(data.expiryDate);
      }
      return true;
    },
    {
      message: 'La fecha de inicio debe ser anterior a la fecha de expiración',
      path: ['expiryDate'],
    },
  );
};

// License search schema
export const searchLicenseSchema = () => {
  return z.object({
    licenseKey: z.string().optional(),
    type: z.enum(['DEMO', 'TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
    active: z.boolean().optional(),
    expiryDateFrom: z.string().datetime().optional(),
    expiryDateTo: z.string().datetime().optional(),
    customerId: z.string().uuid('ID de cliente inválido').optional(),
    contactEmail: z.string().email('Email inválido').optional(),
    page: z
      .number()
      .int()
      .positive()
      .optional()
      .or(z.string().transform(val => parseInt(val, 10))),
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .or(z.string().transform(val => parseInt(val, 10))),
    sortBy: z.string().optional(),
    sortDirection: z.enum(['asc', 'desc']).optional(),
  });
};

// License ID schema
export const licenseIdSchema = () => {
  return z.object({
    id: z
      .string()
      .uuid('ID de licencia inválido')
      .or(z.number().int().positive('ID de licencia inválido')),
  });
};

// License key schema
export const licenseKeySchema = () => {
  return z.object({
    licenseKey: z.string().min(10, 'La clave de licencia debe tener al menos 10 caracteres'),
  });
};

// License activation schema
export const activateLicenseSchema = () => {
  return z.object({
    licenseKey: z.string().min(10, 'La clave de licencia debe tener al menos 10 caracteres'),
    companyName: z.string().min(2, 'El nombre de la compañía debe tener al menos 2 caracteres'),
    contactName: z.string().min(2, 'El nombre de contacto debe tener al menos 2 caracteres'),
    contactEmail: z.string().email('Email inválido'),
    companySize: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  });
};

// Trial activation schema
export const activateTrialSchema = () => {
  return z.object({
    trialCode: z.string().regex(/^(DEMOPACTA|TRYPACTA)$/, 'Código de prueba inválido'),
    companyName: z.string().min(2, 'El nombre de la compañía debe tener al menos 2 caracteres'),
    contactName: z.string().min(2, 'El nombre de contacto debe tener al menos 2 caracteres'),
    contactEmail: z.string().email('Email inválido'),
    companySize: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  });
};

// License statistics schema
export const licenseStatsSchema = () => {
  return z.object({
    timeRange: z.enum(['WEEK', 'MONTH', 'QUARTER', 'YEAR', 'ALL']).default('MONTH'),
    type: z.enum(['DEMO', 'TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  });
};

// Export all schemas for ValidationService
export const licenseValidators = {
  createLicenseSchema,
  updateLicenseSchema,
  searchLicenseSchema,
  licenseIdSchema,
  licenseKeySchema,
  activateLicenseSchema,
  activateTrialSchema,
  licenseStatsSchema,
};

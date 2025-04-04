import { z } from 'zod';

// Base contract schema
const contractBaseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  contractNumber: z.string().min(1, 'El número de contrato es requerido'),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de finalización inválida'),
  value: z.number().positive('El valor debe ser positivo').optional(),
  companyId: z.number().int('ID de compañía inválido'),
  departmentId: z.number().int('ID de departamento inválido').optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']),
  files: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  responsibleEmail: z.string().email('Email inválido').optional(),
  autoRenewal: z.boolean().optional(),
  renewalDays: z.number().int().optional(),
  notes: z.string().optional(),
});

// Contract creation schema
export const createContractSchema = () => {
  return contractBaseSchema.refine(data => new Date(data.startDate) < new Date(data.endDate), {
    message: 'La fecha de inicio debe ser anterior a la fecha de finalización',
    path: ['endDate'],
  });
};

// Contract update schema
export const updateContractSchema = () => {
  return contractBaseSchema.partial().refine(
    data => {
      // Solo validar si ambas fechas están presentes
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'La fecha de inicio debe ser anterior a la fecha de finalización',
      path: ['endDate'],
    },
  );
};

// Contract search schema
export const searchContractSchema = () => {
  return z.object({
    query: z.string().optional(),
    status: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']).optional(),
    startDateFrom: z.string().datetime().optional(),
    startDateTo: z.string().datetime().optional(),
    endDateFrom: z.string().datetime().optional(),
    endDateTo: z.string().datetime().optional(),
    companyId: z.number().int().optional(),
    departmentId: z.number().int().optional(),
    tags: z.array(z.string()).optional(),
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

// Contract ID schema
export const contractIdSchema = () => {
  return z.object({
    id: z
      .string()
      .or(z.number())
      .transform(val => (typeof val === 'string' ? parseInt(val, 10) : val)),
  });
};

// Contract status change schema
export const changeContractStatusSchema = () => {
  return z.object({
    status: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']),
    reason: z.string().optional(),
  });
};

// Contract tag schema
export const contractTagSchema = () => {
  return z.object({
    tags: z.array(z.string()),
  });
};

// Contract query schema
export const contractQuerySchema = () => {
  return z.object({
    page: z.string().optional().transform(val => parseInt(val, 10) || 1),
    limit: z.string().optional().transform(val => parseInt(val, 10) || 10),
    status: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  });
};

// Contract stats query schema
export const contractStatsQuerySchema = () => {
  return z.object({
    period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    companyId: z.number().int().optional(),
  });
};

// Contract tags schema
export const contractTagsSchema = () => {
  return z.object({
    tags: z.array(z.string().min(1)),
  });
};

// Schema para creación de suplemento
export const supplementCreateSchema = () => {
  return z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    effectiveDate: z.string().datetime('Fecha de efectividad inválida'),
  });
};

// Schema para actualización de suplemento
export const supplementUpdateSchema = () => {
  return z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    description: z.string().optional(),
    effectiveDate: z.string().datetime('Fecha de efectividad inválida').optional(),
  });
};

// Export all schemas for ValidationService
export const contract = {
  createContractSchema,
  updateContractSchema,
  searchContractSchema,
  contractIdSchema,
  changeContractStatusSchema,
  contractTagSchema,
  contractQuerySchema,
  contractStatsQuerySchema,
  contractTagsSchema,
  supplementCreateSchema,
  supplementUpdateSchema
};

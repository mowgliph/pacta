import { z } from 'zod';

// Base company schema
const companyBaseSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  legalName: z.string().min(2, 'La razón social debe tener al menos 2 caracteres'),
  taxId: z.string().min(5, 'El ID fiscal debe tener al menos 5 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url('URL inválida').optional().nullable(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional()
    .nullable(),
  industry: z.string().optional().nullable(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  logo: z.string().url('URL de logo inválida').optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  notes: z.string().optional().nullable(),
});

// Company creation schema
export const createCompanySchema = () => {
  return companyBaseSchema;
};

// Company update schema
export const updateCompanySchema = () => {
  return companyBaseSchema.partial();
};

// Company search schema
export const searchCompanySchema = () => {
  return z.object({
    query: z.string().optional(),
    industry: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
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

// Company ID schema
export const companyIdSchema = () => {
  return z.object({
    id: z
      .string()
      .uuid('ID de compañía inválido')
      .or(z.number().int().positive('ID de compañía inválido')),
  });
};

// Company departments schema
export const createDepartmentSchema = () => {
  return z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    companyId: z
      .string()
      .uuid('ID de compañía inválido')
      .or(z.number().int().positive('ID de compañía inválido')),
    parentDepartmentId: z
      .string()
      .uuid('ID de departamento inválido')
      .or(z.number().int().positive('ID de departamento inválido'))
      .optional()
      .nullable(),
    managerUserId: z.string().uuid('ID de usuario inválido').optional().nullable(),
  });
};

// Department update schema
export const updateDepartmentSchema = () => {
  return z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    description: z.string().optional(),
    parentDepartmentId: z
      .string()
      .uuid('ID de departamento inválido')
      .or(z.number().int().positive('ID de departamento inválido'))
      .optional()
      .nullable(),
    managerUserId: z.string().uuid('ID de usuario inválido').optional().nullable(),
  });
};

// Department ID schema
export const departmentIdSchema = () => {
  return z.object({
    id: z
      .string()
      .uuid('ID de departamento inválido')
      .or(z.number().int().positive('ID de departamento inválido')),
  });
};

// Export all schemas for ValidationService
export const companyValidators = {
  createCompanySchema,
  updateCompanySchema,
  searchCompanySchema,
  companyIdSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdSchema,
};

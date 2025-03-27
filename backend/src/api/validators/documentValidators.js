import { z } from 'zod';

// Base document schema
const documentBaseSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  fileType: z.enum(['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'TXT', 'JPG', 'PNG', 'ZIP']),
  size: z.number().int().positive('El tamaño debe ser positivo'),
  tags: z.array(z.string()).optional(),
  contractId: z.string().uuid('ID de contrato inválido').or(z.number().int().positive()).optional(),
  companyId: z.string().uuid('ID de compañía inválido').or(z.number().int().positive()).optional(),
  departmentId: z
    .string()
    .uuid('ID de departamento inválido')
    .or(z.number().int().positive())
    .optional(),
  isPublic: z.boolean().default(false),
  expiryDate: z.string().datetime('Fecha de expiración inválida').optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Document creation schema
export const createDocumentSchema = () => {
  return documentBaseSchema;
};

// Document update schema
export const updateDocumentSchema = () => {
  return documentBaseSchema.partial();
};

// Document search schema
export const searchDocumentSchema = () => {
  return z.object({
    query: z.string().optional(),
    fileType: z
      .enum(['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'TXT', 'JPG', 'PNG', 'ZIP'])
      .array()
      .optional(),
    tags: z.array(z.string()).optional(),
    contractId: z
      .string()
      .uuid('ID de contrato inválido')
      .or(z.number().int().positive())
      .optional(),
    companyId: z
      .string()
      .uuid('ID de compañía inválido')
      .or(z.number().int().positive())
      .optional(),
    departmentId: z
      .string()
      .uuid('ID de departamento inválido')
      .or(z.number().int().positive())
      .optional(),
    isPublic: z.boolean().optional(),
    uploadedBy: z.string().uuid('ID de usuario inválido').optional(),
    minSize: z.number().int().nonnegative().optional(),
    maxSize: z.number().int().positive().optional(),
    uploadedAfter: z.string().datetime().optional(),
    uploadedBefore: z.string().datetime().optional(),
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

// Document ID schema
export const documentIdSchema = () => {
  return z.object({
    id: z
      .string()
      .uuid('ID de documento inválido')
      .or(z.number().int().positive('ID de documento inválido')),
  });
};

// Document upload schema
export const uploadDocumentSchema = () => {
  return z.object({
    title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    contractId: z
      .string()
      .uuid('ID de contrato inválido')
      .or(z.number().int().positive())
      .optional(),
    companyId: z
      .string()
      .uuid('ID de compañía inválido')
      .or(z.number().int().positive())
      .optional(),
    departmentId: z
      .string()
      .uuid('ID de departamento inválido')
      .or(z.number().int().positive())
      .optional(),
    isPublic: z.boolean().default(false),
    expiryDate: z.string().datetime('Fecha de expiración inválida').optional(),
    metadata: z.record(z.unknown()).optional(),
    // No validamos el file ya que se maneja con multer
  });
};

// Document permission schema
export const documentPermissionSchema = () => {
  return z.object({
    userId: z.string().uuid('ID de usuario inválido').or(z.number().int().positive()),
    documentId: z.string().uuid('ID de documento inválido').or(z.number().int().positive()),
    canView: z.boolean().default(true),
    canEdit: z.boolean().default(false),
    canDelete: z.boolean().default(false),
  });
};

// Update document permission schema
export const updateDocumentPermissionSchema = () => {
  return z.object({
    canView: z.boolean().optional(),
    canEdit: z.boolean().optional(),
    canDelete: z.boolean().optional(),
  });
};

// Export all schemas for ValidationService
export const documentValidators = {
  createDocumentSchema,
  updateDocumentSchema,
  searchDocumentSchema,
  documentIdSchema,
  uploadDocumentSchema,
  documentPermissionSchema,
  updateDocumentPermissionSchema,
};

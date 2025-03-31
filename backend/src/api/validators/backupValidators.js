import { z } from 'zod';

// Esquemas base
const paginationSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val, 10) || 1),
  limit: z.string().optional().transform(val => parseInt(val, 10) || 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
});

const compressionSchema = z.object({
  enabled: z.boolean().default(true),
  level: z.number().int().min(1).max(9).default(6)
});

// Esquemas específicos de backup
export const backupQuerySchema = paginationSchema.extend({
  type: z.enum(['manual', 'automatic']).optional(),
  status: z.enum(['completed', 'failed', 'in_progress']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional()
});

export const backupIdSchema = z.object({
  id: z.string().uuid({
    message: 'ID de backup inválido'
  })
});

export const createBackupSchema = z.object({
  type: z.enum(['manual', 'automatic']).default('manual'),
  description: z.string().min(3).max(255).optional(),
  options: z.object({
    includeFiles: z.boolean().default(true),
    includeDatabase: z.boolean().default(true),
    compression: compressionSchema.optional(),
    encryption: z.boolean().default(true)
  }).optional()
});

export const restoreBackupSchema = z.object({
  options: z.object({
    includeFiles: z.boolean().default(true),
    includeDatabase: z.boolean().default(true),
    overwrite: z.boolean().default(false),
    validateIntegrity: z.boolean().default(true),
    rollbackOnError: z.boolean().default(true)
  }).optional()
});

export const exportBackupSchema = z.object({
  format: z.enum(['zip', 'tar', 'encrypted']).default('zip'),
  options: z.object({
    compression: compressionSchema.optional(),
    includeMetadata: z.boolean().default(true),
    encryption: z.object({
      enabled: z.boolean().default(false),
      algorithm: z.enum(['aes-256-cbc']).default('aes-256-cbc')
    }).optional()
  }).optional()
});

export const backupStatsSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('daily'),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional()
});

// Export all schemas as a single object for ValidationService
export const backup = {
  backupQuerySchema,
  backupIdSchema,
  createBackupSchema,
  restoreBackupSchema,
  exportBackupSchema,
  backupStatsSchema
};
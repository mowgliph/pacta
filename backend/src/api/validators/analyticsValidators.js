import { z } from 'zod';

// Analytics time period schema
export const analyticsPeriodSchema = () => {
  return z.object({
    period: z.enum(['day', 'week', 'month', 'quarter', 'year', 'custom']).default('month'),
    startDate: z.string().datetime('Fecha de inicio inválida').optional(),
    endDate: z.string().datetime('Fecha de fin inválida').optional(),
  }).refine(
    data => {
      // Si el periodo es custom, debe proporcionar fechas
      if (data.period === 'custom') {
        return data.startDate && data.endDate;
      }
      return true;
    },
    {
      message: 'Debe proporcionar fechas de inicio y fin cuando el periodo es personalizado',
      path: ['period'],
    }
  ).refine(
    data => {
      // Si hay fechas, validar que la fecha de inicio sea anterior a la de fin
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'La fecha de inicio debe ser anterior a la fecha de fin',
      path: ['endDate'],
    }
  );
};

// Analytics filter schema
export const analyticsFilterSchema = () => {
  return z.object({
    companyId: z.string().uuid('ID de compañía inválido').or(z.number().int().positive()).optional(),
    departmentId: z.string().uuid('ID de departamento inválido').or(z.number().int().positive()).optional(),
    userId: z.string().uuid('ID de usuario inválido').optional(),
    contractStatus: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']).array().optional(),
    contractType: z.string().array().optional(),
    tags: z.string().array().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CUP']).optional(),
  });
};

// Contract analytics schema
export const contractAnalyticsSchema = () => {
  return z.object({
    period: z.enum(['day', 'week', 'month', 'quarter', 'year', 'custom']).default('month'),
    startDate: z.string().datetime('Fecha de inicio inválida').optional(),
    endDate: z.string().datetime('Fecha de fin inválida').optional(),
    groupBy: z.enum(['status', 'type', 'company', 'department', 'tag', 'month', 'quarter', 'year']).optional(),
    includeExpired: z.boolean().optional().default(true),
    includeCancelled: z.boolean().optional().default(false),
    filters: analyticsFilterSchema().optional(),
  });
};

// User activity analytics schema
export const userActivityAnalyticsSchema = () => {
  return z.object({
    period: z.enum(['day', 'week', 'month', 'quarter', 'year', 'custom']).default('month'),
    startDate: z.string().datetime('Fecha de inicio inválida').optional(),
    endDate: z.string().datetime('Fecha de fin inválida').optional(),
    userId: z.string().uuid('ID de usuario inválido').optional(),
    userRole: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']).optional(),
    activityType: z.enum(['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'IMPORT', 'OTHER']).array().optional(),
    entityType: z.enum(['CONTRACT', 'COMPANY', 'USER', 'DEPARTMENT', 'LICENSE', 'DOCUMENT']).array().optional(),
    groupBy: z.enum(['user', 'role', 'activityType', 'entityType', 'day', 'week', 'month']).optional(),
  });
};

// Financial analytics schema
export const financialAnalyticsSchema = () => {
  return z.object({
    period: z.enum(['day', 'week', 'month', 'quarter', 'year', 'custom']).default('month'),
    startDate: z.string().datetime('Fecha de inicio inválida').optional(),
    endDate: z.string().datetime('Fecha de fin inválida').optional(),
    currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CUP']).default('USD'),
    groupBy: z.enum(['company', 'department', 'month', 'quarter', 'year', 'status']).optional(),
    aggregate: z.enum(['sum', 'avg', 'min', 'max', 'count']).default('sum'),
    filters: analyticsFilterSchema().optional(),
  });
};

// Export analytics schema
export const exportAnalyticsSchema = () => {
  return z.object({
    format: z.enum(['JSON', 'CSV', 'EXCEL', 'PDF']).default('JSON'),
    data: z.enum(['contracts', 'users', 'activities', 'financial', 'summary']).array().min(1),
    period: z.enum(['day', 'week', 'month', 'quarter', 'year', 'custom']).default('month'),
    startDate: z.string().datetime('Fecha de inicio inválida').optional(),
    endDate: z.string().datetime('Fecha de fin inválida').optional(),
    filters: analyticsFilterSchema().optional(),
    includeCharts: z.boolean().optional().default(true),
    includeRawData: z.boolean().optional().default(true),
    fileName: z.string().optional(),
  });
};

// Summary analytics schema
export const summaryAnalyticsSchema = () => {
  return z.object({
    period: z.enum(['day', 'week', 'month', 'quarter', 'year', 'custom']).default('month'),
    startDate: z.string().datetime('Fecha de inicio inválida').optional(),
    endDate: z.string().datetime('Fecha de fin inválida').optional(),
    includeContracts: z.boolean().optional().default(true),
    includeFinancial: z.boolean().optional().default(true),
    includeActivities: z.boolean().optional().default(true),
    includeUsers: z.boolean().optional().default(true),
    filters: analyticsFilterSchema().optional(),
  });
};

// Export all schemas for ValidationService
export const analyticsValidators = {
  analyticsPeriodSchema,
  analyticsFilterSchema,
  contractAnalyticsSchema,
  userActivityAnalyticsSchema,
  financialAnalyticsSchema,
  exportAnalyticsSchema,
  summaryAnalyticsSchema
}; 
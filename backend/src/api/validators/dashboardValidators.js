import { z } from 'zod';

// Dashboard time range schema
export const timeRangeSchema = () => {
  return z.object({
    timeRange: z.enum(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR', 'CUSTOM']).default('MONTH'),
    startDate: z.string().datetime('Fecha de inicio inválida').optional(),
    endDate: z.string().datetime('Fecha de fin inválida').optional(),
  }).refine(
    data => {
      // Si el rango es CUSTOM, debe proporcionar fechas
      if (data.timeRange === 'CUSTOM') {
        return data.startDate && data.endDate;
      }
      return true;
    },
    {
      message: 'Debe proporcionar fechas de inicio y fin cuando el rango es personalizado',
      path: ['timeRange'],
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

// Dashboard filter schema
export const dashboardFilterSchema = () => {
  return z.object({
    companyId: z.string().uuid('ID de compañía inválido').or(z.number().int().positive()).optional(),
    departmentId: z.string().uuid('ID de departamento inválido').or(z.number().int().positive()).optional(),
    userId: z.string().uuid('ID de usuario inválido').optional(),
    contractStatus: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']).array().optional(),
    contractType: z.string().array().optional(),
    tags: z.string().array().optional(),
  });
};

// KPI options schema
export const kpiOptionsSchema = () => {
  return z.object({
    indicators: z.array(
      z.enum([
        'TOTAL_CONTRACTS',
        'ACTIVE_CONTRACTS',
        'EXPIRING_CONTRACTS',
        'EXPIRED_CONTRACTS',
        'CONTRACT_VALUE',
        'CONTRACTS_BY_DEPARTMENT',
        'CONTRACTS_BY_STATUS',
        'CONTRACTS_BY_TYPE',
        'USERS',
        'ACTIVITIES'
      ])
    ).optional(),
    includeCharts: z.boolean().default(true),
    includeTables: z.boolean().default(true),
  });
};

// Dashboard config schema
export const dashboardConfigSchema = () => {
  return z.object({
    layout: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['KPI', 'CHART', 'TABLE', 'LIST']),
        title: z.string(),
        size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
        position: z.object({
          x: z.number().int().nonnegative(),
          y: z.number().int().nonnegative(),
          w: z.number().int().positive(),
          h: z.number().int().positive(),
        }),
        config: z.record(z.unknown()).optional(),
      })
    ),
    refreshInterval: z.number().int().nonnegative().optional(),
    defaultTimeRange: z.enum(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR']).default('MONTH'),
    defaultFilters: dashboardFilterSchema().optional(),
  });
};

// Dashboard report options
export const reportOptionsSchema = () => {
  return z.object({
    format: z.enum(['PDF', 'EXCEL', 'CSV']),
    timeRange: z.enum(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR', 'CUSTOM']).default('MONTH'),
    startDate: z.string().datetime('Fecha de inicio inválida').optional(),
    endDate: z.string().datetime('Fecha de fin inválida').optional(),
    filters: dashboardFilterSchema().optional(),
    includeCharts: z.boolean().default(true),
    includeTables: z.boolean().default(true),
    sections: z.array(z.string()).optional(),
  });
};

// Export all schemas for ValidationService
export const dashboardValidators = {
  timeRangeSchema,
  dashboardFilterSchema,
  kpiOptionsSchema,
  dashboardConfigSchema,
  reportOptionsSchema
}; 
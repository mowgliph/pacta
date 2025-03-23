import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

export class ValidationService {
  static validate(schema, data) {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        throw new ValidationError('Validation failed', 'VALIDATION_ERROR', errors);
      }
      throw error;
    }
  }

  static createPaginationSchema() {
    return z.object({
      page: z.string().optional().transform(val => parseInt(val, 10) || 1),
      limit: z.string().optional().transform(val => parseInt(val, 10) || 10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
    });
  }

  static createSearchSchema() {
    return z.object({
      query: z.string().min(1),
      fields: z.array(z.string()).optional(),
      page: z.string().optional().transform(val => parseInt(val, 10) || 1),
      limit: z.string().optional().transform(val => parseInt(val, 10) || 10)
    });
  }

  static createFilterSchema(fields) {
    const schema = {};
    fields.forEach(field => {
      schema[field] = z.string().optional();
    });
    return z.object(schema);
  }

  static createDateRangeSchema() {
    return z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      timezone: z.string().optional()
    });
  }

  static createIdSchema() {
    return z.object({
      id: z.string().uuid()
    });
  }

  static createIdsSchema() {
    return z.object({
      ids: z.array(z.string().uuid())
    });
  }

  static createEmailSchema() {
    return z.object({
      email: z.string().email()
    });
  }

  static createPasswordSchema() {
    return z.object({
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    });
  }

  static createLoginSchema() {
    return z.object({
      email: z.string().email(),
      password: z.string()
    });
  }

  static createRegisterSchema() {
    return z.object({
      email: z.string().email(),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });
  }

  static createFileSchema() {
    return z.object({
      file: z.instanceof(File, { message: 'File is required' })
        .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
        .refine((file) => file.type.startsWith('image/'), 'File must be an image')
    });
  }

  static createTokenSchema() {
    return z.object({
      token: z.string().min(1)
    });
  }

  static createRefreshTokenSchema() {
    return z.object({
      refreshToken: z.string().min(1)
    });
  }
} 
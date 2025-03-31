import { z } from 'zod';

// Base user schema
const userBaseSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().url().optional().nullable(),
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
  preferences: z.record(z.unknown()).optional(),
});

// User registration schema
export const createUserRegistrationSchema = () => {
  return userBaseSchema
    .extend({
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
};

// User login schema
export const createUserLoginSchema = () => {
  return z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  });
};

// User profile update schema
export const createUserProfileSchema = () => {
  return userBaseSchema.omit({ email: true }).partial();
};

// User full update schema (for admin)
export const createUserUpdateSchema = () => {
  return userBaseSchema
    .extend({
      role: z.enum(['admin', 'user', 'moderator']).optional(),
      status: z.enum(['active', 'inactive', 'suspended']).optional(),
      emailVerified: z.boolean().optional(),
    })
    .partial();
};

// User status update schema
export const createUserStatusSchema = () => {
  return z.object({
    status: z.enum(['active', 'inactive', 'suspended']),
  });
};

// User role update schema
export const createUserRoleSchema = () => {
  return z.object({
    role: z.enum(['admin', 'user', 'moderator']),
  });
};

// Password reset request schema
export const createPasswordResetRequestSchema = () => {
  return z.object({
    email: z.string().email('Invalid email address'),
  });
};

// Password reset schema
export const createPasswordResetSchema = () => {
  return z
    .object({
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      confirmPassword: z.string(),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
};

// Change password schema
export const createChangePasswordSchema = () => {
  return z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      confirmPassword: z.string(),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
};

// Bulk user creation schema
export const createBulkUserCreateSchema = () => {
  return z
    .array(
      userBaseSchema.extend({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        role: z.enum(['admin', 'user', 'moderator']).optional(),
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
      }),
    )
    .min(1, 'At least one user is required')
    .max(100, 'Maximum of 100 users can be created at once');
};

// Bulk user update schema
export const createBulkUserUpdateSchema = () => {
  return z
    .array(
      z.object({
        id: z.string().uuid('Invalid user ID'),
        data: userBaseSchema
          .extend({
            role: z.enum(['admin', 'user', 'moderator']).optional(),
            status: z.enum(['active', 'inactive', 'suspended']).optional(),
            emailVerified: z.boolean().optional(),
          })
          .partial(),
      }),
    )
    .min(1, 'At least one user is required')
    .max(100, 'Maximum of 100 users can be updated at once');
};

// User ID schema
export const userIdSchema = () => {
  return z.object({
    id: z.string().uuid('Invalid user ID'),
  });
};

// User query schema
export const userQuerySchema = () => {
  return z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    search: z.string().optional(),
    role: z.enum(['admin', 'user', 'moderator']).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  });
};

// User preferences schema
export const userPreferencesSchema = () => {
  return z.record(z.unknown());
};

// Export all schemas for ValidationService
export const user = {
  userCreateSchema: createUserRegistrationSchema,
  userLoginSchema: createUserLoginSchema,
  userProfileSchema: createUserProfileSchema,
  userUpdateSchema: createUserUpdateSchema,
  userStatusSchema: createUserStatusSchema,
  userRoleSchema: createUserRoleSchema,
  userIdSchema,
  userQuerySchema,
  userPreferencesSchema,
  changePasswordSchema: createChangePasswordSchema,
};

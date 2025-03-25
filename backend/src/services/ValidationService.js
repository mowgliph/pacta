import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';
import * as userValidators from '../api/validators/userValidators.js';
import * as contractValidators from '../api/validators/contractValidators.js';
import * as notificationValidators from '../api/validators/notificationValidators.js';

export class ValidationService {
  constructor() {
    // Import validators dynamically
    this.validators = {
      ...userValidators,
      ...contractValidators,
      ...notificationValidators,
    };
  }

  async validate(schema, data) {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ValidationError('Validation failed', errors);
      }
      throw error;
    }
  }

  async validateUserRegistration(data) {
    const schema = this.validators.createUserRegistrationSchema();
    return this.validate(schema, data);
  }

  async validateUserLogin(data) {
    const schema = this.validators.createUserLoginSchema();
    return this.validate(schema, data);
  }

  async validateUserProfile(data) {
    const schema = this.validators.createUserProfileSchema();
    return this.validate(schema, data);
  }

  async validateUserUpdate(data) {
    const schema = this.validators.createUserUpdateSchema();
    return this.validate(schema, data);
  }

  async validatePassword(password) {
    const schema = z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

    return this.validate(schema, password);
  }

  // Standard schemas
  createPaginationSchema() {
    return z.object({
      page: z
        .string()
        .optional()
        .transform(val => parseInt(val, 10) || 1),
      limit: z
        .string()
        .optional()
        .transform(val => parseInt(val, 10) || 10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    });
  }

  createSearchSchema() {
    return z.object({
      query: z.string().min(1),
      fields: z.array(z.string()).optional(),
      page: z
        .string()
        .optional()
        .transform(val => parseInt(val, 10) || 1),
      limit: z
        .string()
        .optional()
        .transform(val => parseInt(val, 10) || 10),
    });
  }

  createFilterSchema(fields) {
    const schema = {};
    fields.forEach(field => {
      schema[field] = z.string().optional();
    });
    return z.object(schema);
  }

  createDateRangeSchema() {
    return z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      timezone: z.string().optional(),
    });
  }

  createIdSchema() {
    return z.object({
      id: z.string().uuid(),
    });
  }

  createIdsSchema() {
    return z.object({
      ids: z.array(z.string().uuid()),
    });
  }

  createEmailSchema() {
    return z.object({
      email: z.string().email(),
    });
  }

  createTokenSchema() {
    return z.object({
      token: z.string().min(1),
    });
  }

  createRefreshTokenSchema() {
    return z.object({
      refreshToken: z.string().min(1),
    });
  }

  // User specific schemas
  createUserRegistrationSchema() {
    return this.validators.createUserRegistrationSchema();
  }

  createUserLoginSchema() {
    return this.validators.createUserLoginSchema();
  }

  createUserProfileSchema() {
    return this.validators.createUserProfileSchema();
  }

  createUserUpdateSchema() {
    return this.validators.createUserUpdateSchema();
  }

  createUserStatusSchema() {
    return this.validators.createUserStatusSchema();
  }

  createUserRoleSchema() {
    return this.validators.createUserRoleSchema();
  }

  createPasswordResetSchema() {
    return this.validators.createPasswordResetSchema();
  }

  createChangePasswordSchema() {
    return this.validators.createChangePasswordSchema();
  }

  createBulkUserCreateSchema() {
    return this.validators.createBulkUserCreateSchema();
  }

  createBulkUserUpdateSchema() {
    return this.validators.createBulkUserUpdateSchema();
  }

  // Contract specific schemas and validation methods
  async validateContractCreation(data) {
    const schema = this.validators.createContractSchema();
    return this.validate(schema, data);
  }

  async validateContractUpdate(data) {
    const schema = this.validators.updateContractSchema();
    return this.validate(schema, data);
  }

  async validateContractSearch(data) {
    const schema = this.validators.searchContractSchema();
    return this.validate(schema, data);
  }

  async validateContractId(data) {
    const schema = this.validators.contractIdSchema();
    return this.validate(schema, data);
  }

  async validateContractStatusChange(data) {
    const schema = this.validators.changeContractStatusSchema();
    return this.validate(schema, data);
  }

  createContractSchema() {
    return this.validators.createContractSchema();
  }

  updateContractSchema() {
    return this.validators.updateContractSchema();
  }

  searchContractSchema() {
    return this.validators.searchContractSchema();
  }

  contractIdSchema() {
    return this.validators.contractIdSchema();
  }

  changeContractStatusSchema() {
    return this.validators.changeContractStatusSchema();
  }

  // Notification specific schemas and validation methods
  async validateNotificationCreation(data) {
    const schema = this.validators.createNotificationSchema();
    return this.validate(schema, data);
  }

  async validateBulkNotificationCreation(data) {
    const schema = this.validators.createBulkNotificationSchema();
    return this.validate(schema, data);
  }

  async validateMarkAsRead(data) {
    const schema = this.validators.markAsReadSchema();
    return this.validate(schema, data);
  }

  async validateGetNotifications(data) {
    const schema = this.validators.getNotificationsSchema();
    return this.validate(schema, data);
  }
  
  async validateExpirationNotifications(data) {
    const schema = this.validators.createExpirationNotificationsSchema();
    return this.validate(schema, data);
  }

  createNotificationSchema() {
    return this.validators.createNotificationSchema();
  }

  createBulkNotificationSchema() {
    return this.validators.createBulkNotificationSchema();
  }

  markAsReadSchema() {
    return this.validators.markAsReadSchema();
  }

  getNotificationsSchema() {
    return this.validators.getNotificationsSchema();
  }

  createExpirationNotificationsSchema() {
    return this.validators.createExpirationNotificationsSchema();
  }
}

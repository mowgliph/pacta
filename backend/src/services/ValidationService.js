import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';
import * as userValidators from '../api/validators/userValidators.js';
import * as contractValidators from '../api/validators/contractValidators.js';
import * as notificationValidators from '../api/validators/notificationValidators.js';
import * as companyValidators from '../api/validators/companyValidators.js';
import * as licenseValidators from '../api/validators/licenseValidators.js';
import * as dashboardValidators from '../api/validators/dashboardValidators.js';
import * as analyticsValidators from '../api/validators/analyticsValidators.js';
import * as documentValidators from '../api/validators/documentValidators.js';
import * as authValidators from '../api/validators/authValidators.js';

export class ValidationService {
  constructor() {
    // Import validators dynamically
    this.validators = {
      ...userValidators,
      ...contractValidators,
      ...notificationValidators,
      ...companyValidators,
      ...licenseValidators,
      ...dashboardValidators,
      ...analyticsValidators,
      ...documentValidators,
      ...authValidators,
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

  // Company specific schemas and validation methods
  async validateCompanyCreation(data) {
    const schema = this.validators.createCompanySchema();
    return this.validate(schema, data);
  }

  async validateCompanyUpdate(data) {
    const schema = this.validators.updateCompanySchema();
    return this.validate(schema, data);
  }

  async validateCompanySearch(data) {
    const schema = this.validators.searchCompanySchema();
    return this.validate(schema, data);
  }

  async validateCompanyId(data) {
    const schema = this.validators.companyIdSchema();
    return this.validate(schema, data);
  }

  async validateDepartmentCreation(data) {
    const schema = this.validators.createDepartmentSchema();
    return this.validate(schema, data);
  }

  async validateDepartmentUpdate(data) {
    const schema = this.validators.updateDepartmentSchema();
    return this.validate(schema, data);
  }

  async validateDepartmentId(data) {
    const schema = this.validators.departmentIdSchema();
    return this.validate(schema, data);
  }

  createCompanySchema() {
    return this.validators.createCompanySchema();
  }

  updateCompanySchema() {
    return this.validators.updateCompanySchema();
  }

  searchCompanySchema() {
    return this.validators.searchCompanySchema();
  }

  companyIdSchema() {
    return this.validators.companyIdSchema();
  }

  createDepartmentSchema() {
    return this.validators.createDepartmentSchema();
  }

  updateDepartmentSchema() {
    return this.validators.updateDepartmentSchema();
  }

  departmentIdSchema() {
    return this.validators.departmentIdSchema();
  }

  // License specific schemas and validation methods
  async validateLicenseCreation(data) {
    const schema = this.validators.createLicenseSchema();
    return this.validate(schema, data);
  }

  async validateLicenseUpdate(data) {
    const schema = this.validators.updateLicenseSchema();
    return this.validate(schema, data);
  }

  async validateLicenseSearch(data) {
    const schema = this.validators.searchLicenseSchema();
    return this.validate(schema, data);
  }

  async validateLicenseId(data) {
    const schema = this.validators.licenseIdSchema();
    return this.validate(schema, data);
  }

  async validateLicenseKey(data) {
    const schema = this.validators.licenseKeySchema();
    return this.validate(schema, data);
  }

  async validateLicenseActivation(data) {
    const schema = this.validators.activateLicenseSchema();
    return this.validate(schema, data);
  }

  async validateTrialActivation(data) {
    const schema = this.validators.activateTrialSchema();
    return this.validate(schema, data);
  }

  async validateLicenseStats(data) {
    const schema = this.validators.licenseStatsSchema();
    return this.validate(schema, data);
  }

  createLicenseSchema() {
    return this.validators.createLicenseSchema();
  }

  updateLicenseSchema() {
    return this.validators.updateLicenseSchema();
  }

  searchLicenseSchema() {
    return this.validators.searchLicenseSchema();
  }

  licenseIdSchema() {
    return this.validators.licenseIdSchema();
  }

  licenseKeySchema() {
    return this.validators.licenseKeySchema();
  }

  activateLicenseSchema() {
    return this.validators.activateLicenseSchema();
  }

  activateTrialSchema() {
    return this.validators.activateTrialSchema();
  }

  licenseStatsSchema() {
    return this.validators.licenseStatsSchema();
  }

  // Dashboard specific schemas and validation methods
  async validateTimeRange(data) {
    const schema = this.validators.timeRangeSchema();
    return this.validate(schema, data);
  }

  async validateDashboardFilter(data) {
    const schema = this.validators.dashboardFilterSchema();
    return this.validate(schema, data);
  }

  async validateKpiOptions(data) {
    const schema = this.validators.kpiOptionsSchema();
    return this.validate(schema, data);
  }

  async validateDashboardConfig(data) {
    const schema = this.validators.dashboardConfigSchema();
    return this.validate(schema, data);
  }

  async validateReportOptions(data) {
    const schema = this.validators.reportOptionsSchema();
    return this.validate(schema, data);
  }

  timeRangeSchema() {
    return this.validators.timeRangeSchema();
  }

  dashboardFilterSchema() {
    return this.validators.dashboardFilterSchema();
  }

  kpiOptionsSchema() {
    return this.validators.kpiOptionsSchema();
  }

  dashboardConfigSchema() {
    return this.validators.dashboardConfigSchema();
  }

  reportOptionsSchema() {
    return this.validators.reportOptionsSchema();
  }

  // Analytics specific schemas and validation methods
  async validateAnalyticsPeriod(data) {
    const schema = this.validators.analyticsPeriodSchema();
    return this.validate(schema, data);
  }

  async validateAnalyticsFilter(data) {
    const schema = this.validators.analyticsFilterSchema();
    return this.validate(schema, data);
  }

  async validateContractAnalytics(data) {
    const schema = this.validators.contractAnalyticsSchema();
    return this.validate(schema, data);
  }

  async validateUserActivityAnalytics(data) {
    const schema = this.validators.userActivityAnalyticsSchema();
    return this.validate(schema, data);
  }

  async validateFinancialAnalytics(data) {
    const schema = this.validators.financialAnalyticsSchema();
    return this.validate(schema, data);
  }

  async validateExportAnalytics(data) {
    const schema = this.validators.exportAnalyticsSchema();
    return this.validate(schema, data);
  }

  async validateSummaryAnalytics(data) {
    const schema = this.validators.summaryAnalyticsSchema();
    return this.validate(schema, data);
  }

  analyticsPeriodSchema() {
    return this.validators.analyticsPeriodSchema();
  }

  analyticsFilterSchema() {
    return this.validators.analyticsFilterSchema();
  }

  contractAnalyticsSchema() {
    return this.validators.contractAnalyticsSchema();
  }

  userActivityAnalyticsSchema() {
    return this.validators.userActivityAnalyticsSchema();
  }

  financialAnalyticsSchema() {
    return this.validators.financialAnalyticsSchema();
  }

  exportAnalyticsSchema() {
    return this.validators.exportAnalyticsSchema();
  }

  summaryAnalyticsSchema() {
    return this.validators.summaryAnalyticsSchema();
  }

  // Document specific schemas and validation methods
  async validateDocumentCreation(data) {
    const schema = this.validators.createDocumentSchema();
    return this.validate(schema, data);
  }

  async validateDocumentUpdate(data) {
    const schema = this.validators.updateDocumentSchema();
    return this.validate(schema, data);
  }

  async validateDocumentSearch(data) {
    const schema = this.validators.searchDocumentSchema();
    return this.validate(schema, data);
  }

  async validateDocumentId(data) {
    const schema = this.validators.documentIdSchema();
    return this.validate(schema, data);
  }

  async validateDocumentUpload(data) {
    const schema = this.validators.uploadDocumentSchema();
    return this.validate(schema, data);
  }

  async validateDocumentPermission(data) {
    const schema = this.validators.documentPermissionSchema();
    return this.validate(schema, data);
  }

  async validateDocumentPermissionUpdate(data) {
    const schema = this.validators.updateDocumentPermissionSchema();
    return this.validate(schema, data);
  }

  createDocumentSchema() {
    return this.validators.createDocumentSchema();
  }

  updateDocumentSchema() {
    return this.validators.updateDocumentSchema();
  }

  searchDocumentSchema() {
    return this.validators.searchDocumentSchema();
  }

  documentIdSchema() {
    return this.validators.documentIdSchema();
  }

  uploadDocumentSchema() {
    return this.validators.uploadDocumentSchema();
  }

  documentPermissionSchema() {
    return this.validators.documentPermissionSchema();
  }

  updateDocumentPermissionSchema() {
    return this.validators.updateDocumentPermissionSchema();
  }

  // Auth specific schemas and validation methods
  async validateLogin(data) {
    const schema = this.validators.loginSchema();
    return this.validate(schema, data);
  }

  async validateRegistration(data) {
    const schema = this.validators.registrationSchema();
    return this.validate(schema, data);
  }

  async validatePasswordResetRequest(data) {
    const schema = this.validators.passwordResetRequestSchema();
    return this.validate(schema, data);
  }

  async validatePasswordReset(data) {
    const schema = this.validators.passwordResetSchema();
    return this.validate(schema, data);
  }

  async validateEmailVerification(data) {
    const schema = this.validators.emailVerificationSchema();
    return this.validate(schema, data);
  }

  async validateChangePassword(data) {
    const schema = this.validators.changePasswordSchema();
    return this.validate(schema, data);
  }

  async validateRefreshToken(data) {
    const schema = this.validators.refreshTokenSchema();
    return this.validate(schema, data);
  }

  async validateTwoFactorSetup(data) {
    const schema = this.validators.twoFactorSetupSchema();
    return this.validate(schema, data);
  }

  async validateTwoFactorVerify(data) {
    const schema = this.validators.twoFactorVerifySchema();
    return this.validate(schema, data);
  }

  async validateOauthLogin(data) {
    const schema = this.validators.oauthLoginSchema();
    return this.validate(schema, data);
  }

  loginSchema() {
    return this.validators.loginSchema();
  }

  registrationSchema() {
    return this.validators.registrationSchema();
  }

  passwordResetRequestSchema() {
    return this.validators.passwordResetRequestSchema();
  }

  passwordResetSchema() {
    return this.validators.passwordResetSchema();
  }

  emailVerificationSchema() {
    return this.validators.emailVerificationSchema();
  }

  changePasswordSchema() {
    return this.validators.changePasswordSchema();
  }

  refreshTokenSchema() {
    return this.validators.refreshTokenSchema();
  }

  twoFactorSetupSchema() {
    return this.validators.twoFactorSetupSchema();
  }

  twoFactorVerifySchema() {
    return this.validators.twoFactorVerifySchema();
  }

  oauthLoginSchema() {
    return this.validators.oauthLoginSchema();
  }
}

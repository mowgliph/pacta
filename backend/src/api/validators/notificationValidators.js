import { z } from 'zod';

// Base notification schema
const notificationBaseSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  title: z.string().min(1, 'El título es requerido'),
  message: z.string().min(1, 'El mensaje es requerido'),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'SYSTEM', 'CONTRACT']),
  isRead: z.boolean().default(false),
  url: z.string().url('URL inválida').optional(),
  metadata: z.record(z.unknown()).optional(),
  expiresAt: z.string().datetime('Fecha de expiración inválida').optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
  relatedId: z.string().optional(),
  relatedType: z.string().optional(),
});

// Notification creation schema
export const createNotificationSchema = () => {
  return notificationBaseSchema;
};

// Create notification for multiple users schema
export const createBulkNotificationSchema = () => {
  return z.object({
    userIds: z
      .array(z.string().uuid('ID de usuario inválido'))
      .min(1, 'Se requiere al menos un usuario'),
    title: z.string().min(1, 'El título es requerido'),
    message: z.string().min(1, 'El mensaje es requerido'),
    type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'SYSTEM', 'CONTRACT']),
    url: z.string().url('URL inválida').optional(),
    metadata: z.record(z.unknown()).optional(),
    expiresAt: z.string().datetime('Fecha de expiración inválida').optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
    relatedId: z.string().optional(),
    relatedType: z.string().optional(),
  });
};

// Mark notification as read schema
export const markAsReadSchema = () => {
  return z.object({
    ids: z.union([
      z.string().uuid('ID de notificación inválido'),
      z
        .array(z.string().uuid('ID de notificación inválido'))
        .min(1, 'Se requiere al menos una notificación'),
    ]),
  });
};

// Get notifications query schema
export const getNotificationsSchema = () => {
  return z.object({
    page: z
      .string()
      .optional()
      .transform(val => parseInt(val, 10) || 1),
    limit: z
      .string()
      .optional()
      .transform(val => parseInt(val, 10) || 10),
    isRead: z
      .string()
      .optional()
      .transform(val => val === 'true'),
    type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'SYSTEM', 'CONTRACT']).optional(),
    fromDate: z.string().datetime('Fecha de inicio inválida').optional(),
    toDate: z.string().datetime('Fecha de fin inválida').optional(),
  });
};

// Create expiration notifications schema
export const createExpirationNotificationsSchema = () => {
  return z.object({
    daysThreshold: z
      .number()
      .int()
      .positive()
      .max(365)
      .default(30)
      .or(z.string().transform(val => parseInt(val, 10))),
  });
};

// Export all schemas for ValidationService
export const notificationValidators = {
  createNotificationSchema,
  createBulkNotificationSchema,
  markAsReadSchema,
  getNotificationsSchema,
  createExpirationNotificationsSchema,
};

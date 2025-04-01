/**
 * Roles de usuario definidos en el backend.
 */
export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

/**
 * Estados de usuario definidos en el backend.
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

/**
 * Estados de contrato definidos en el backend.
 */
export enum ContractStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Tipos de documento definidos en el backend.
 */
export enum DocumentType {
  CONTRACT = 'CONTRACT',
  AMENDMENT = 'AMENDMENT',
  ANNEX = 'ANNEX',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER',
}

/**
 * Estados de pago definidos en el backend.
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
} 
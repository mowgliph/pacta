/**
 * Roles de usuario definidos en el backend.
 */
export enum Role {
  RA = 'RA',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

/**
 * Estados de usuario definidos en el backend.
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Estados de contrato definidos en el backend.
 */
export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  PENDING_RENEWAL = 'PENDING_RENEWAL',
  RENEWED = 'RENEWED',
  ARCHIVED = 'ARCHIVED',
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
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
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
}

/**
 * Estados de contrato definidos en el backend.
 */
export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Estados de suplemento definidos en el backend.
 */
export enum SupplementStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
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
  PARTIALLY_PAID = 'PARTIALLY_PAID',
}

/**
 * Tipos de notificación definidos en el sistema.
 */
export enum NotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

/**
 * Orden de clasificación
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
} 
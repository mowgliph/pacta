/**
 * Enums para la aplicación PACTA
 */

// Roles de usuario
export enum Role {
  RA = 'RA',             // Desarrollador con acceso completo
  ADMIN = 'ADMIN',       // Administrador del sistema
  MANAGER = 'MANAGER',   // Gestor con permisos amplios
  USER = 'USER',         // Usuario estándar
  VIEWER = 'VIEWER'      // Solo lectura
}

// Estado del usuario
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// Estado de los contratos (debe coincidir con ContractStatus en services/contracts-service.ts)
export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  RENEWAL = 'RENEWAL'
}

// Tipo de contratos (debe coincidir con ContractType en services/contracts-service.ts)
export enum ContractType {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  EMPLOYEE = 'EMPLOYEE',
  OTHER = 'OTHER'
}

// Tipo de documento
export enum DocumentType {
  CONTRACT = 'CONTRACT',
  AMENDMENT = 'AMENDMENT',
  ANNEX = 'ANNEX',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER'
} 
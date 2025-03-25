import { prisma } from '../database/prisma.js';
import User from './User.js';

// Exportar el cliente Prisma
export { prisma };

// Exportar modelos
export { User };

// Exportar tipos y enums de Prisma
export const {
  Role,
  UserStatus,
  ContractStatus,
  ContractType,
  RenewalType,
  NotificationType,
  ReportFormat,
} = prisma;

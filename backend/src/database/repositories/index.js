/**
 * Exportación centralizada de repositorios
 */
// Repositorios base
export { BasePrismaRepository } from './BasePrismaRepository.js';
export { BaseRepository } from './BaseRepository.js';

// Repositorios Prisma (principales)
export { UserPrismaRepository } from './UserPrismaRepository.js';
export { ContractPrismaRepository } from './ContractPrismaRepository.js';
export { LicensePrismaRepository } from './LicensePrismaRepository.js';
export { ActivityLogPrismaRepository } from './ActivityLogPrismaRepository.js';
export { NotificationPrismaRepository } from './NotificationPrismaRepository.js';
export { ReportPrismaRepository } from './ReportPrismaRepository.js';
export { CompanyPrismaRepository } from './CompanyPrismaRepository.js';

// Exportar instancias predeterminadas
import userPrismaRepository from './UserPrismaRepository.js';
import contractPrismaRepository from './ContractPrismaRepository.js';
import companyPrismaRepository from './CompanyPrismaRepository.js';
import notificationPrismaRepository from './NotificationPrismaRepository.js';
import licensePrismaRepository from './LicensePrismaRepository.js';
import activityLogPrismaRepository from './ActivityLogPrismaRepository.js';
import reportPrismaRepository from './ReportPrismaRepository.js';

// Exportación predeterminada de repositorios
export default {
  user: userPrismaRepository,
  contract: contractPrismaRepository,
  company: companyPrismaRepository,
  notification: notificationPrismaRepository,
  license: licensePrismaRepository,
  activityLog: activityLogPrismaRepository,
  report: reportPrismaRepository
};

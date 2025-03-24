/**
 * Exportación centralizada de repositorios
 */
// Repositorios base
export { BasePrismaRepository } from './BasePrismaRepository.js';
export { BaseRepository } from './BaseRepository.js';

// Repositorios Prisma (principales)
export { UserPrismaRepository } from './UserPrismaRepository.js';
export { ContractPrismaRepository } from './ContractPrismaRepository.js';
export { CompanyPrismaRepository } from './CompanyPrismaRepository.js';
export { NotificationPrismaRepository } from './NotificationPrismaRepository.js';

// Repositorios Sequelize (obsoletos)
export { UserRepository } from './UserRepository.js';
export { ContractRepository } from './ContractRepository.js';
export { CompanyRepository } from './CompanyRepository.js';
export { NotificationRepository } from './NotificationRepository.js';

// Exportar instancias predeterminadas
import userPrismaRepository from './UserPrismaRepository.js';
import contractPrismaRepository from './ContractPrismaRepository.js';
import companyPrismaRepository from './CompanyPrismaRepository.js';
import notificationPrismaRepository from './NotificationPrismaRepository.js';

// Exportación predeterminada de repositorios
export default {
  user: userPrismaRepository,
  contract: contractPrismaRepository,
  company: companyPrismaRepository,
  notification: notificationPrismaRepository,
};

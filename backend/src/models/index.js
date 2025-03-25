import { prisma } from '../database/prisma.js';
import User from './User.js';
import { sequelize } from '../database/dbconnection.js';
import { db } from '../database/dbconnection.js';
import Contract from './Contract.js';
import Notification from './Notification.js';
import License from './License.js';
import ActivityLog from './ActivityLog.js';

// Importar y aplicar asociaciones desde associations.js
import './associations.js';

// Inicializar modelos
const models = {
  User: User(db),
  Contract: Contract(db),
  Notification: Notification(db),
  License: License(db),
  ActivityLog: ActivityLog(db),
};

// Establecer asociaciones
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Define model associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Contract, { foreignKey: 'userId', as: 'contracts' });
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
  User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });

  // Other associations
  Contract.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
};

// Initialize associations
setupAssociations();

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

// Export models and sequelize
export { sequelize, User, Contract, License, ActivityLog, Notification, db };

export default models;

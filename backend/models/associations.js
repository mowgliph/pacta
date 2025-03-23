import User from './User.js';
import Contract from './Contract.js';
import Notification from './Notification.js';
import License from './License.js';
import ActivityLog from './ActivityLog.js';

// User - Contract associations
User.hasMany(Contract, { foreignKey: 'userId' });
Contract.belongsTo(User, { foreignKey: 'userId' });

// User - Notification associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User - ActivityLog associations
User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

// License - Contract associations
License.hasMany(Contract, { foreignKey: 'licenseId' });
Contract.belongsTo(License, { foreignKey: 'licenseId' });

// Contract - ActivityLog associations
Contract.hasMany(ActivityLog, { foreignKey: 'contractId' });
ActivityLog.belongsTo(Contract, { foreignKey: 'contractId' });

export { User, Contract, Notification, License, ActivityLog };
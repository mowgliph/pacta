import User from './User.js';
import Contract from './Contract.js';
import License from './License.js';
import ActivityLog from './ActivityLog.js';
import Notification from './Notification.js';

// User - Contract associations
User.hasMany(Contract, { foreignKey: 'createdBy' });
Contract.belongsTo(User, { foreignKey: 'createdBy' });

// User - ActivityLog associations
User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Contract.hasMany(Notification, { foreignKey: 'contractId' });
Notification.belongsTo(Contract, { foreignKey: 'contractId' });

// User - License associations
User.belongsTo(License, {
  foreignKey: 'licenseId',
  as: 'license'
});

License.hasMany(User, {
  foreignKey: 'licenseId',
  as: 'users'
});

export { User, Contract, License, ActivityLog, Notification };
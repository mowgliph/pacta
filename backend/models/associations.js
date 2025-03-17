import User from './User.js';
import Contract from './Contract.js';
import License from './License.js';
import ActivityLog from './ActivityLog.js';

// User - Contract associations
User.hasMany(Contract, { foreignKey: 'createdBy' });
Contract.belongsTo(User, { foreignKey: 'createdBy' });

// User - ActivityLog associations
User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

export { User, Contract, License, ActivityLog };
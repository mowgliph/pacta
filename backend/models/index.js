import sequelize from '../config/database.js';
import User from './User.js';
import Contract from './Contract.js';
import License from './License.js';
import ActivityLog from './ActivityLog.js';
import Notification from './Notification.js';

// Importar y aplicar asociaciones desde associations.js
import './associations.js';

// Definimos los modelos
const models = {
  User,
  Contract,
  License,
  ActivityLog,
  Notification
};

// Set up associations from model definitions
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export {
  User,
  Contract,
  License,
  ActivityLog,
  Notification,
  sequelize
};

export default models;
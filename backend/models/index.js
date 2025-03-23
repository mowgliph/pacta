import { db } from '../database/dbconnection.js';
import User from './User.js';
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
  ActivityLog: ActivityLog(db)
};

// Establecer asociaciones
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
  db
};

export default models;
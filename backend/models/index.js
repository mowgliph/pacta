import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sequelize from '../config/database.js';
import User from './User.js';
import Contract from './Contract.js';
import License from './License.js';
import ActivityLog from './ActivityLog.js';
import Notification from './Notification.js';

const models = {
  User,
  Contract,
  License,
  ActivityLog,
  Notification
};

// Set up associations
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
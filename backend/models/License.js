import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const License = sequelize.define('License', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  licenseKey: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('DEMO', 'TRIAL', 'FULL'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

export default License;
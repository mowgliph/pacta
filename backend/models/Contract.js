import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'terminated'),
    defaultValue: 'active'
  },
  notificationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  documentPath: {
    type: DataTypes.STRING
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

export default Contract;
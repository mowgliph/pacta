import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/dbconnection.js';

class Notification extends Model {}

Notification.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS'),
    allowNull: false,
    defaultValue: 'INFO'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'GENERAL'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['type']
    },
    {
      fields: ['read']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Asociaciones
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// Hooks
Notification.beforeCreate(async (notification) => {
  // Si no se especifica expiresAt, establecer por defecto a 30 días
  if (!notification.expiresAt) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    notification.expiresAt = expiry;
  }
});

// Métodos de instancia
Notification.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

Notification.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Formatear fechas
  if (values.createdAt) values.createdAt = values.createdAt.toISOString();
  if (values.updatedAt) values.updatedAt = values.updatedAt.toISOString();
  if (values.readAt) values.readAt = values.readAt.toISOString();
  if (values.expiresAt) values.expiresAt = values.expiresAt.toISOString();

  return values;
};

export default Notification;
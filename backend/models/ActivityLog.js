import { Model, DataTypes } from 'sequelize';

export default function ActivityLog(db) {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.User, { foreignKey: 'userId' });
      ActivityLog.belongsTo(models.Contract, { foreignKey: 'entityId', constraints: false });
    }

    static async logActivity(userId, action, entityType, entityId, details) {
      return this.create({
        userId,
        action,
        entityType,
        entityId,
        details,
        timestamp: new Date()
      });
    }
  }

  ActivityLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'UPDATE_STATUS']]
      }
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Contract', 'User', 'License', 'Notification', 'Contract_Document']]
      }
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize: db,
    modelName: 'ActivityLog',
    tableName: 'activity_logs',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['entityType', 'entityId']
      },
      {
        fields: ['timestamp']
      }
    ]
  });

  return ActivityLog;
}
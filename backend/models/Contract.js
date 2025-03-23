import { DataTypes } from 'sequelize';
import sequelize from '../database/dbconnection.js';

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  contractNumber: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 1000]
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString()
    }
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterStartDate(value) {
        if (value <= this.startDate) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'expired', 'terminated', 'renewed'),
    defaultValue: 'draft'
  },
  notificationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    validate: {
      min: 1,
      max: 90
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'CUP',
    validate: {
      isIn: [['CUP', 'USD', 'EUR']]
    }
  },
  documentPath: {
    type: DataTypes.STRING(255)
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  lastModifiedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  hooks: {
    beforeCreate: (contract) => {
      contract.lastModifiedBy = contract.createdBy;
    },
    beforeUpdate: (contract) => {
      // lastModifiedBy will be set in the update operation
    }
  }
});

// Instance method to check if contract is expiring soon
Contract.prototype.isExpiringSoon = function() {
  const today = new Date();
  const daysUntilExpiry = Math.ceil((this.endDate - today) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= this.notificationDays;
};

export default Contract;
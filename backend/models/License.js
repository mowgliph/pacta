import { DataTypes, Op } from 'sequelize';
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
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('DEMO', 'TRIAL', 'FULL'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: true
    }
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterStartDate(value) {
        if (value <= this.startDate) {
          throw new Error('Expiry date must be after start date');
        }
      }
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 100
    }
  },
  features: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  lastValidated: {
    type: DataTypes.DATE
  },
  activationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  hooks: {
    beforeValidate: (license) => {
      if (!license.expiryDate && license.type) {
        // Set default expiry based on license type
        const now = new Date();
        switch (license.type) {
          case 'DEMO':
            license.expiryDate = new Date(now.setDate(now.getDate() + 30)); // 30 days
            break;
          case 'TRIAL':
            license.expiryDate = new Date(now.setDate(now.getDate() + 90)); // 90 days
            break;
          case 'FULL':
            license.expiryDate = new Date(now.setFullYear(now.getFullYear() + 1)); // 1 year
            break;
        }
      }
    }
  }
});

// Instance method to check if license is valid
License.prototype.isValid = function() {
  const now = new Date();
  return this.active && now <= new Date(this.expiryDate);
};

// Instance method to check if license is expiring soon (within 30 days)
License.prototype.isExpiringSoon = function(days = 30) {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((new Date(this.expiryDate) - now) / (1000 * 60 * 60 * 24));
  return this.isValid() && daysUntilExpiry <= days;
};

// Class method to get current active license
License.getCurrentLicense = async function() {
  return await this.findOne({
    where: {
      active: true,
      expiryDate: {
        [Op.gt]: new Date()
      }
    },
    order: [['expiryDate', 'DESC']]
  });
};

export default License;
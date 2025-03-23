import { DataTypes, Op } from 'sequelize';
import sequelize from '../database/dbconnection.js';

const License = sequelize.define('License', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  licenseKey: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /^[A-Z0-9]{14}$/i // Formato específico para claves de licencia
    }
  },
  type: {
    type: DataTypes.ENUM('TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'),
    allowNull: false,
    validate: {
      notEmpty: true
    }
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
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  features: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      maxUsers: 1,
      maxContracts: 10,
      maxStorage: 1024, // MB
      allowedModules: ['basic']
    },
    validate: {
      isValidFeatures(value) {
        if (!value.maxUsers || value.maxUsers < 1) {
          throw new Error('maxUsers must be at least 1');
        }
        if (!value.maxContracts || value.maxContracts < 1) {
          throw new Error('maxContracts must be at least 1');
        }
        if (!value.maxStorage || value.maxStorage < 1) {
          throw new Error('maxStorage must be at least 1MB');
        }
        if (!Array.isArray(value.allowedModules) || value.allowedModules.length === 0) {
          throw new Error('allowedModules must be a non-empty array');
        }
      }
    }
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    validate: {
      isValidMetadata(value) {
        const requiredFields = ['environment', 'version'];
        for (const field of requiredFields) {
          if (!value[field]) {
            throw new Error(`Metadata must include ${field}`);
          }
        }
      }
    }
  },
  lastValidated: {
    type: DataTypes.DATE
  },
  activationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5 // Límite de activaciones por licencia
    }
  }
}, {
  hooks: {
    beforeValidate: (license) => {
      if (!license.expiryDate && license.type) {
        const now = new Date();
        const expiryDates = {
          TRIAL: 30, // 30 días
          BASIC: 365, // 1 año
          PROFESSIONAL: 365, // 1 año
          ENTERPRISE: 730, // 2 años
          CUSTOM: 365 // 1 año por defecto
        };
        
        const days = expiryDates[license.type] || 365;
        license.expiryDate = new Date(now.setDate(now.getDate() + days));
      }

      // Establecer características predeterminadas según el tipo de licencia
      if (license.type && !license.features) {
        const defaultFeatures = {
          TRIAL: {
            maxUsers: 2,
            maxContracts: 10,
            maxStorage: 1024,
            allowedModules: ['basic']
          },
          BASIC: {
            maxUsers: 5,
            maxContracts: 50,
            maxStorage: 5120,
            allowedModules: ['basic', 'reports']
          },
          PROFESSIONAL: {
            maxUsers: 20,
            maxContracts: 200,
            maxStorage: 20480,
            allowedModules: ['basic', 'reports', 'analytics', 'export']
          },
          ENTERPRISE: {
            maxUsers: 100,
            maxContracts: 1000,
            maxStorage: 102400,
            allowedModules: ['basic', 'reports', 'analytics', 'export', 'api']
          },
          CUSTOM: {
            maxUsers: 5,
            maxContracts: 50,
            maxStorage: 5120,
            allowedModules: ['basic']
          }
        };

        license.features = defaultFeatures[license.type];
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['licenseKey']
    },
    {
      fields: ['type']
    },
    {
      fields: ['active', 'expiryDate']
    }
  ]
});

// Método de instancia para verificar si la licencia es válida
License.prototype.isValid = function() {
  const now = new Date();
  return this.active && now <= new Date(this.expiryDate);
};

// Método de instancia para verificar si la licencia está por expirar
License.prototype.isExpiringSoon = function(days = 30) {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((new Date(this.expiryDate) - now) / (1000 * 60 * 60 * 24));
  return this.isValid() && daysUntilExpiry <= days;
};

// Método de instancia para verificar si se puede activar la licencia
License.prototype.canActivate = function() {
  return this.activationCount < 5 && this.isValid();
};

// Método de instancia para activar la licencia
License.prototype.activate = async function(metadata = {}) {
  if (!this.canActivate()) {
    throw new Error('License cannot be activated: exceeded activation limit or expired');
  }

  this.activationCount += 1;
  this.lastValidated = new Date();
  this.metadata = { ...this.metadata, ...metadata };
  
  await this.save();
  return this;
};

// Método de clase para obtener la licencia activa actual
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

// Método de clase para generar una clave de licencia única
License.generateLicenseKey = async function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key;
  let isUnique = false;

  while (!isUnique) {
    key = Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const existing = await this.findOne({ where: { licenseKey: key } });
    if (!existing) isUnique = true;
  }

  return key;
};

export default License;
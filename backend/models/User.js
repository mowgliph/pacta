import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../database/dbconnection.js';

export class User extends Model {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.refreshToken;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'moderator'),
      defaultValue: 'user',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
    profilePicture: {
      type: DataTypes.STRING,
    },
    phoneNumber: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.JSON,
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['status'],
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await User.hashPassword(user.password);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await User.hashPassword(user.password);
        }
      },
    },
  }
);
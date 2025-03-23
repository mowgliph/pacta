import { BaseRepository } from './BaseRepository.js';
import { User } from '../../models/User.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.findOne({ where: { email } });
  }

  async findByRefreshToken(refreshToken) {
    return this.findOne({ where: { refreshToken } });
  }

  async findByEmailVerificationToken(token) {
    return this.findOne({ where: { emailVerificationToken: token } });
  }

  async findByPasswordResetToken(token) {
    return this.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [this.model.sequelize.Op.gt]: new Date(),
        },
      },
    });
  }

  async findActiveUsers() {
    return this.findAll({
      where: {
        status: 'active',
        emailVerified: true,
      },
    });
  }

  async findInactiveUsers() {
    return this.findAll({
      where: {
        status: 'inactive',
      },
    });
  }

  async findSuspendedUsers() {
    return this.findAll({
      where: {
        status: 'suspended',
      },
    });
  }

  async findUnverifiedUsers() {
    return this.findAll({
      where: {
        emailVerified: false,
      },
    });
  }

  async updateLastLogin(userId) {
    return this.update(
      { lastLogin: new Date() },
      { where: { id: userId } }
    );
  }

  async updateRefreshToken(userId, refreshToken) {
    return this.update(
      { refreshToken },
      { where: { id: userId } }
    );
  }

  async updateEmailVerification(userId, verified) {
    return this.update(
      {
        emailVerified: verified,
        emailVerificationToken: verified ? null : this.generateToken(),
      },
      { where: { id: userId } }
    );
  }

  async updatePasswordResetToken(userId) {
    const token = this.generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    return this.update(
      {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
      { where: { id: userId } }
    );
  }

  async clearPasswordResetToken(userId) {
    return this.update(
      {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
      { where: { id: userId } }
    );
  }

  async updateStatus(userId, status) {
    return this.update(
      { status },
      { where: { id: userId } }
    );
  }

  async updateRole(userId, role) {
    return this.update(
      { role },
      { where: { id: userId } }
    );
  }

  async updateProfile(userId, data) {
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'address',
      'profilePicture',
      'preferences',
    ];

    const updateData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    return this.update(updateData, { where: { id: userId } });
  }

  generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
} 
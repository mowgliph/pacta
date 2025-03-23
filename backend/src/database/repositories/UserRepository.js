/**
 * Repositorio para operaciones relacionadas con usuarios
 */
import { BaseRepository } from './BaseRepository.js';
import User from '../../models/User.js';
import { Op } from 'sequelize';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Busca un usuario por su email
   * @param {String} email - Email del usuario
   * @returns {Promise<Object>} - Usuario encontrado
   */
  async findByEmail(email) {
    return this.findOne({ email });
  }

  /**
   * Busca usuarios por nombre o apellido (búsqueda parcial)
   * @param {String} query - Texto a buscar
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Usuarios encontrados con paginación
   */
  async searchByName(query, page = 1, limit = 10) {
    return this.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${query}%` } },
          { lastName: { [Op.like]: `%${query}%` } }
        ]
      }
    }, page, limit);
  }

  /**
   * Actualiza el último login de un usuario
   * @param {String} userId - ID del usuario
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateLastLogin(userId) {
    return this.update(userId, { lastLogin: new Date() });
  }

  /**
   * Actualiza el rol de un usuario
   * @param {String} userId - ID del usuario 
   * @param {String} role - Nuevo rol ('admin', 'user', 'guest')
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateRole(userId, role) {
    if (!['admin', 'user', 'guest'].includes(role)) {
      throw new Error('Rol inválido');
    }
    return this.update(userId, { role });
  }

  /**
   * Actualiza el estado de un usuario
   * @param {String} userId - ID del usuario
   * @param {String} status - Nuevo estado ('active', 'inactive', 'suspended')
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateStatus(userId, status) {
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      throw new Error('Estado inválido');
    }
    return this.update(userId, { status });
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

export default new UserRepository(); 
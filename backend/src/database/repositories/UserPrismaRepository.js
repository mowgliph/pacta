/**
 * Repositorio para operaciones relacionadas con usuarios usando Prisma
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

class UserPrismaRepository extends BasePrismaRepository {
  constructor() {
    super('user');
  }

  /**
   * Busca un usuario por su email
   * @param {String} email - Email del usuario
   * @returns {Promise<Object>} - Usuario encontrado
   */
  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Busca usuarios por nombre o apellido (búsqueda parcial)
   * @param {String} query - Texto a buscar
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Usuarios encontrados con paginación
   */
  async searchByName(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } }
      ],
      deletedAt: null
    };
    
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);
    
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Actualiza el último login de un usuario
   * @param {String} userId - ID del usuario
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateLastLogin(userId) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() }
    });
  }

  /**
   * Actualiza el rol de un usuario
   * @param {String} userId - ID del usuario 
   * @param {String} role - Nuevo rol ('ADMIN', 'USER', 'GUEST')
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateRole(userId, role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  }

  /**
   * Actualiza el estado de un usuario
   * @param {String} userId - ID del usuario
   * @param {String} status - Nuevo estado ('ACTIVE', 'INACTIVE', 'SUSPENDED')
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateStatus(userId, status) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  }
}

export default new UserPrismaRepository(); 
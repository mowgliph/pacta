/**
 * Repositorio para operaciones relacionadas con contratos usando Prisma
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class ContractPrismaRepository extends BasePrismaRepository {
  constructor() {
    super('contract');
  }

  /**
   * Busca contratos por título o descripción
   * @param {String} query - Texto a buscar
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Contratos encontrados con paginación
   */
  async searchByTerm(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      OR: [{ title: { contains: query } }, { description: { contains: query } }],
      deletedAt: null,
    };

    const [total, contracts] = await Promise.all([
      this.prisma.contract.count({ where }),
      this.prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
        },
      }),
    ]);

    return {
      data: contracts,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Encuentra los contratos por usuario
   * @param {String} userId - ID del usuario
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Contratos con paginación
   */
  async findByUser(userId, page = 1, limit = 10) {
    return this.findAll(
      {
        where: {
          authorId: userId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
        },
      },
      page,
      limit,
    );
  }

  /**
   * Actualiza el estado de un contrato
   * @param {String} id - ID del contrato
   * @param {String} status - Nuevo estado
   * @returns {Promise<Object>} - Contrato actualizado
   */
  async updateStatus(id, status) {
    return this.prisma.contract.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Busca contratos próximos a vencer
   * @param {Number} days - Días para vencimiento
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Contratos con paginación
   */
  async findExpiringSoon(days = 30, page = 1, limit = 10) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.findAll(
      {
        where: {
          endDate: {
            gte: today,
            lte: futureDate,
          },
          status: 'ACTIVE',
          deletedAt: null,
        },
        orderBy: { endDate: 'asc' },
        include: {
          company: true,
          author: true,
        },
      },
      page,
      limit,
    );
  }
}

export default new ContractPrismaRepository();

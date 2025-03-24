/**
 * Repositorio para operaciones relacionadas con empresas usando Prisma
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class CompanyPrismaRepository extends BasePrismaRepository {
  constructor() {
    super('company');
  }

  /**
   * Busca empresas por nombre (búsqueda parcial)
   * @param {String} query - Texto a buscar
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Empresas encontradas con paginación
   */
  async searchByName(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      name: { contains: query },
      deletedAt: null,
    };

    const [total, companies] = await Promise.all([
      this.prisma.company.count({ where }),
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca empresas activas
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Empresas activas con paginación
   */
  async findActive(page = 1, limit = 10) {
    return this.findAll(
      {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      },
      page,
      limit,
    );
  }

  /**
   * Busca empresas inactivas (borrado lógico)
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Empresas inactivas con paginación
   */
  async findInactive(page = 1, limit = 10) {
    return this.findAll(
      {
        where: { NOT: { deletedAt: null } },
        orderBy: { name: 'asc' },
      },
      page,
      limit,
    );
  }
}

export default new CompanyPrismaRepository(); 
/**
 * Repositorio para operaciones relacionadas con Compañías
 * Extiende las funcionalidades básicas para el modelo Company
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class CompanyRepository extends BasePrismaRepository {
  constructor() {
    super('company');
  }

  /**
   * Encuentra compañías con filtrado
   * @param {Object} filters - Filtros para la búsqueda
   * @param {Number} page - Número de página
   * @param {Number} limit - Límite de resultados por página
   * @returns {Promise<Object>} - Compañías encontradas con metadata
   */
  async findCompanies(filters = {}, page = 1, limit = 10) {
    const { search, industry, sortBy = 'name', sortOrder = 'asc' } = filters;

    // Construir condiciones de búsqueda
    const where = {};

    // Filtro de texto de búsqueda
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { taxId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (industry) where.industry = industry;

    // No mostrar compañías eliminadas
    where.deletedAt = null;

    // Configurar ordenamiento
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    return this.findAll(
      {
        where,
        orderBy,
        include: {
          departments: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              contracts: true,
            },
          },
        },
      },
      page,
      limit,
    );
  }

  /**
   * Encuentra compañías con más contratos
   * @param {Number} limit - Límite de resultados
   * @returns {Promise<Array>} - Compañías con más contratos
   */
  async findTopCompaniesByContracts(limit = 5) {
    return this.prisma.company.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        industry: true,
        _count: {
          select: {
            contracts: true,
          },
        },
      },
      orderBy: {
        contracts: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  /**
   * Encuentra compañías con contratos a vencer pronto
   * @param {Number} daysThreshold - Días umbral para considerar próximo a vencer
   * @returns {Promise<Array>} - Compañías con contratos por vencer
   */
  async findCompaniesWithExpiringContracts(daysThreshold = 30) {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return this.prisma.company.findMany({
      where: {
        contracts: {
          some: {
            endDate: {
              gte: today,
              lte: thresholdDate,
            },
            status: {
              in: ['ACTIVE', 'PENDING_RENEWAL'],
            },
            deletedAt: null,
          },
        },
        deletedAt: null,
      },
      include: {
        contracts: {
          where: {
            endDate: {
              gte: today,
              lte: thresholdDate,
            },
            status: {
              in: ['ACTIVE', 'PENDING_RENEWAL'],
            },
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            endDate: true,
            contractType: true,
          },
        },
      },
    });
  }
}

/**
 * Repositorio para operaciones relacionadas con Contratos
 * Extiende las funcionalidades básicas para el modelo Contract
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class ContractRepository extends BasePrismaRepository {
  constructor() {
    super('contract');
  }

  /**
   * Encuentra contratos con filtrado avanzado
   * @param {Object} filters - Filtros para la búsqueda
   * @param {Number} page - Número de página
   * @param {Number} limit - Límite de resultados por página
   * @returns {Promise<Object>} - Contratos encontrados con metadata
   */
  async findContracts(filters = {}, page = 1, limit = 10) {
    const {
      search,
      status,
      contractType,
      companyId,
      departmentId,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Construir condiciones de búsqueda
    const where = {};

    // Filtro de texto de búsqueda (búsqueda en varios campos)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (status) where.status = status;
    if (contractType) where.contractType = contractType;
    if (companyId) where.companyId = companyId;
    if (departmentId) where.departmentId = departmentId;

    // Rangos de fechas
    if (startDateFrom) where.startDate = { ...where.startDate, gte: new Date(startDateFrom) };
    if (startDateTo) where.startDate = { ...where.startDate, lte: new Date(startDateTo) };
    if (endDateFrom) where.endDate = { ...where.endDate, gte: new Date(endDateFrom) };
    if (endDateTo) where.endDate = { ...where.endDate, lte: new Date(endDateTo) };

    // Filtro por tags
    if (tags && tags.length > 0) {
      where.contractTags = {
        some: {
          tagId: {
            in: Array.isArray(tags) ? tags : [tags],
          },
        },
      };
    }

    // No mostrar contratos eliminados
    where.deletedAt = null;

    // Configurar ordenamiento
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    return this.findAll(
      {
        where,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              taxId: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          contractTags: {
            include: {
              tag: true,
            },
          },
        },
      },
      page,
      limit,
    );
  }

  /**
   * Encuentra contratos próximos a vencer
   * @param {Number} daysThreshold - Días umbral para considerar próximo a vencer
   * @param {Number} limit - Límite de resultados
   * @returns {Promise<Array>} - Contratos próximos a vencer
   */
  async findExpiringContracts(daysThreshold = 30, limit = 10) {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return this.prisma.contract.findMany({
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
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contractTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
      take: limit,
    });
  }

  /**
   * Encuentra contratos por compañía
   * @param {String} companyId - ID de la compañía
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} - Contratos de la compañía
   */
  async findByCompany(companyId, options = {}) {
    return this.prisma.contract.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...options.where,
      },
      ...options,
      orderBy: options.orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * Actualiza el estado de un contrato
   * @param {String} id - ID del contrato
   * @param {String} status - Nuevo estado
   * @returns {Promise<Object>} - Contrato actualizado
   */
  async updateStatus(id, status) {
    return this.update(id, { status });
  }
}

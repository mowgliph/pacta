/**
 * Servicio para la gestión de compañías
 * Contiene la lógica de negocio relacionada con compañías
 */
import { BaseService } from './BaseService.js';
import { CompanyRepository } from '../database/repositories/CompanyRepository.js';
import { LoggingService } from './LoggingService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { CacheService } from './CacheService.js';

export class CompanyService extends BaseService {
  constructor() {
    super(new CompanyRepository());
    this.companyRepository = this.repository;
    this.cacheService = new CacheService();
  }

  /**
   * Obtiene compañías con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @param {Number} page - Número de página
   * @param {Number} limit - Límite de resultados
   * @returns {Promise<Object>} - Resultados con paginación
   */
  async getCompanies(filters = {}, page = 1, limit = 10) {
    try {
      // Clave de cache basada en los filtros y paginación
      const cacheKey = `companies:${JSON.stringify(filters)}:page${page}:limit${limit}`;

      // Intentar obtener del cache primero
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.companyRepository.findCompanies(filters, page, limit);

      // Guardar en cache por 10 minutos
      await this.cacheService.set(cacheKey, result, 600);

      return result;
    } catch (error) {
      LoggingService.error('Error getting companies', { filters, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Crea una nueva compañía
   * @param {Object} data - Datos de la compañía
   * @returns {Promise<Object>} - Compañía creada
   */
  async createCompany(data) {
    try {
      // Validar datos de la compañía
      this._validateCompanyData(data);

      // Verificar si ya existe una compañía con el mismo taxId
      if (data.taxId) {
        const existing = await this.companyRepository.findOne({ where: { taxId: data.taxId } });
        if (existing) {
          throw new ValidationError(`A company with tax ID ${data.taxId} already exists`);
        }
      }

      // Crear la compañía
      const newCompany = await this.companyRepository.create(data);

      // Invalidar caches relacionados
      await this.cacheService.invalidatePattern('companies:*');

      LoggingService.info('Company created', { companyId: newCompany.id });

      return newCompany;
    } catch (error) {
      LoggingService.error('Error creating company', { data, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Actualiza una compañía existente
   * @param {String} id - ID de la compañía
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Compañía actualizada
   */
  async updateCompany(id, data) {
    try {
      // Verificar que la compañía existe
      const company = await this.companyRepository.findById(id);
      if (!company) {
        throw new NotFoundError(`Company with ID ${id} not found`);
      }

      // Validar taxId único si se está actualizando
      if (data.taxId && data.taxId !== company.taxId) {
        const existing = await this.companyRepository.findOne({ where: { taxId: data.taxId } });
        if (existing && existing.id !== id) {
          throw new ValidationError(`A company with tax ID ${data.taxId} already exists`);
        }
      }

      // Actualizar la compañía
      const updatedCompany = await this.companyRepository.update(id, data);

      // Invalidar caches relacionados
      await this.cacheService.invalidatePattern('companies:*');
      await this.cacheService.invalidate(`company:${id}`);

      LoggingService.info('Company updated', { companyId: id });

      return updatedCompany;
    } catch (error) {
      LoggingService.error('Error updating company', { id, data, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Obtiene compañías con más contratos
   * @param {Number} limit - Límite de resultados
   * @returns {Promise<Array>} - Compañías con más contratos
   */
  async getTopCompaniesByContracts(limit = 5) {
    try {
      const cacheKey = `top-companies:${limit}`;

      // Intentar obtener del cache primero
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const companies = await this.companyRepository.findTopCompaniesByContracts(limit);

      // Guardar en cache por 1 hora
      await this.cacheService.set(cacheKey, companies, 3600);

      return companies;
    } catch (error) {
      LoggingService.error('Error getting top companies', { limit, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Obtiene compañías con contratos a vencer pronto
   * @param {Number} daysThreshold - Días umbral
   * @returns {Promise<Array>} - Compañías con contratos por vencer
   */
  async getCompaniesWithExpiringContracts(daysThreshold = 30) {
    try {
      const cacheKey = `companies-expiring-contracts:${daysThreshold}`;

      // Intentar obtener del cache primero
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const companies =
        await this.companyRepository.findCompaniesWithExpiringContracts(daysThreshold);

      // Guardar en cache por 1 hora
      await this.cacheService.set(cacheKey, companies, 3600);

      return companies;
    } catch (error) {
      LoggingService.error('Error getting companies with expiring contracts', {
        daysThreshold,
        error: error.message,
      });
      this._handleError(error);
    }
  }

  /**
   * Validación de datos de compañía
   * @param {Object} data - Datos a validar
   * @private
   */
  _validateCompanyData(data) {
    // Verificar campos requeridos
    const requiredFields = ['name'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validar formato de correo electrónico
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new ValidationError('Invalid email format');
      }
    }
  }
}

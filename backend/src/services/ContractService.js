/**
 * Servicio para la gestión de contratos
 * Contiene la lógica de negocio relacionada con contratos
 */
import { BaseService } from './BaseService.js';
import repositories from '../database/repositories/index.js';
import { LoggingService } from './LoggingService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { ValidationService } from './ValidationService.js';
import CacheService from './CacheService.js';
import NotificationService from './NotificationService.js';

export class ContractService extends BaseService {
  constructor() {
    super(repositories.contract);
    this.contractRepository = repositories.contract;
    this.logger = new LoggingService('ContractService');
    this.cacheService = new CacheService('contracts');
    this.notificationService = new NotificationService();
  }

  /**
   * Obtiene contratos con filtros avanzados
   * @param {Object} filters - Filtros de búsqueda
   * @param {Number} page - Número de página
   * @param {Number} limit - Límite de resultados
   * @returns {Promise<Object>} - Resultados con paginación
   */
  async getContracts(filters = {}, page = 1, limit = 10) {
    try {
      // Clave de cache basada en los filtros y paginación
      const cacheKey = `contracts:${JSON.stringify(filters)}:page${page}:limit${limit}`;

      // Intentar obtener del cache primero
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.contractRepository.findContracts(filters, page, limit);

      // Guardar en cache por 5 minutos
      await this.cacheService.set(cacheKey, result, 300);

      return result;
    } catch (error) {
      LoggingService.error('Error getting contracts', { filters, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Crea un nuevo contrato
   * @param {Object} data - Datos del contrato
   * @param {String} userId - ID del usuario creador
   * @returns {Promise<Object>} - Contrato creado
   */
  async createContract(data, userId) {
    try {
      // Validar datos del contrato
      this._validateContractData(data);

      // Asignar usuario creador
      const contractData = {
        ...data,
        authorId: userId,
      };

      // Crear el contrato
      const newContract = await this.contractRepository.create(contractData);

      // Invalidar caches relacionados
      await this.cacheService.invalidatePattern('contracts:*');

      LoggingService.info('Contract created', { contractId: newContract.id, userId });

      return newContract;
    } catch (error) {
      LoggingService.error('Error creating contract', { data, userId, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Actualiza un contrato existente
   * @param {String} id - ID del contrato
   * @param {Object} data - Datos a actualizar
   * @param {String} userId - ID del usuario que actualiza
   * @returns {Promise<Object>} - Contrato actualizado
   */
  async updateContract(id, data, userId) {
    try {
      // Verificar que el contrato existe
      const contract = await this.contractRepository.findById(id);
      if (!contract) {
        throw new NotFoundError(`Contract with ID ${id} not found`);
      }

      // Actualizar el contrato
      const updatedContract = await this.contractRepository.update(id, data);

      // Invalidar caches relacionados
      await this.cacheService.invalidatePattern('contracts:*');
      await this.cacheService.invalidate(`contract:${id}`);

      LoggingService.info('Contract updated', { contractId: id, userId });

      return updatedContract;
    } catch (error) {
      LoggingService.error('Error updating contract', { id, data, userId, error: error.message });
      this._handleError(error);
    }
  }

  /**
   * Cambia el estado de un contrato
   * @param {String} id - ID del contrato
   * @param {String} status - Nuevo estado
   * @param {String} userId - ID del usuario que realiza el cambio
   * @returns {Promise<Object>} - Contrato actualizado
   */
  async changeContractStatus(id, status, userId) {
    try {
      // Verificar que el contrato existe
      const contract = await this.contractRepository.findById(id);
      if (!contract) {
        throw new NotFoundError(`Contract with ID ${id} not found`);
      }

      // Validar que el estado sea válido
      const validStatuses = [
        'DRAFT',
        'ACTIVE',
        'EXPIRED',
        'TERMINATED',
        'PENDING_RENEWAL',
        'RENEWED',
        'ARCHIVED',
      ];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Invalid status: ${status}`);
      }

      // Actualizar el estado
      const updatedContract = await this.contractRepository.updateStatus(id, status);

      // Invalidar caches relacionados
      await this.cacheService.invalidatePattern('contracts:*');
      await this.cacheService.invalidate(`contract:${id}`);

      LoggingService.info('Contract status changed', { contractId: id, status, userId });

      return updatedContract;
    } catch (error) {
      LoggingService.error('Error changing contract status', {
        id,
        status,
        userId,
        error: error.message,
      });
      this._handleError(error);
    }
  }

  /**
   * Obtiene contratos que están próximos a vencer
   * @param {Number} daysThreshold - Días umbral
   * @param {Number} limit - Límite de resultados
   * @returns {Promise<Array>} - Contratos próximos a vencer
   */
  async getExpiringContracts(daysThreshold = 30, limit = 10) {
    try {
      const cacheKey = `expiring-contracts:${daysThreshold}:${limit}`;

      // Intentar obtener del cache primero
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const contracts = await this.contractRepository.findExpiringContracts(daysThreshold, limit);

      // Guardar en cache por 1 hora
      await this.cacheService.set(cacheKey, contracts, 3600);

      return contracts;
    } catch (error) {
      LoggingService.error('Error getting expiring contracts', {
        daysThreshold,
        limit,
        error: error.message,
      });
      this._handleError(error);
    }
  }

  /**
   * Validación de datos de contrato
   * @param {Object} data - Datos a validar
   * @private
   */
  _validateContractData(data) {
    // Verificar campos requeridos
    const requiredFields = ['title', 'companyId', 'fileUrl', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validar fechas
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime())) {
      throw new ValidationError('Invalid start date');
    }

    if (isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid end date');
    }

    if (endDate <= startDate) {
      throw new ValidationError('End date must be after start date');
    }

    // Validar campos opcionales numéricos
    if (data.alertDays !== undefined && (isNaN(data.alertDays) || data.alertDays < 0)) {
      throw new ValidationError('Alert days must be a positive number');
    }

    if (data.renewalPeriod !== undefined && (isNaN(data.renewalPeriod) || data.renewalPeriod < 0)) {
      throw new ValidationError('Renewal period must be a positive number');
    }
  }
}

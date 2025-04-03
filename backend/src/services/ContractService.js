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
  
  /**
   * Obtiene los suplementos asociados a un contrato
   * @param {String} contractId - ID del contrato
   * @param {String} userId - ID del usuario solicitante
   * @param {String} userRole - Rol del usuario
   * @returns {Promise<Array>} - Lista de suplementos
   */
  async getContractSupplements(contractId, userId, userRole) {
    try {
      // Verificar que el contrato existe
      const contract = await this.contractRepository.findById(contractId);
      if (!contract) {
        throw new NotFoundError(`Contract with ID ${contractId} not found`);
      }
      
      // Obtener suplementos del repositorio
      const supplements = await repositories.supplement.findByContractId(contractId);
      
      LoggingService.info('Contract supplements fetched', { contractId, userId });
      
      return supplements;
    } catch (error) {
      LoggingService.error('Error getting contract supplements', {
        contractId,
        userId,
        error: error.message,
      });
      this._handleError(error);
    }
  }
  
  /**
   * Obtiene un suplemento específico por su ID
   * @param {String} id - ID del suplemento
   * @param {String} userId - ID del usuario solicitante
   * @param {String} userRole - Rol del usuario
   * @returns {Promise<Object>} - Suplemento encontrado
   */
  async getSupplementById(id, userId, userRole) {
    try {
      // Buscar el suplemento
      const supplement = await repositories.supplement.findById(id);
      if (!supplement) {
        throw new NotFoundError(`Supplement with ID ${id} not found`);
      }
      
      // Verificar que el contrato asociado existe
      const contract = await this.contractRepository.findById(supplement.contractId);
      if (!contract) {
        throw new NotFoundError(`Associated contract not found`);
      }
      
      LoggingService.info('Supplement fetched', { supplementId: id, userId });
      
      return supplement;
    } catch (error) {
      LoggingService.error('Error getting supplement', {
        supplementId: id,
        userId,
        error: error.message,
      });
      this._handleError(error);
    }
  }
  
  /**
   * Crea un nuevo suplemento para un contrato
   * @param {String} contractId - ID del contrato
   * @param {Object} data - Datos del suplemento
   * @param {String} userId - ID del usuario creador
   * @param {String} userRole - Rol del usuario
   * @returns {Promise<Object>} - Suplemento creado
   */
  async createSupplement(contractId, data, userId, userRole) {
    try {
      // Verificar que el contrato existe
      const contract = await this.contractRepository.findById(contractId);
      if (!contract) {
        throw new NotFoundError(`Contract with ID ${contractId} not found`);
      }
      
      // Validar datos básicos del suplemento
      this._validateSupplementData(data);
      
      // Preparar datos para crear el suplemento
      const supplementData = {
        name: data.name,
        description: data.description,
        effectiveDate: data.effectiveDate,
        contractId: contractId,
        documentUrl: data.fileData ? data.fileData.fileUrl : null,
        createdBy: userId
      };
      
      // Crear el suplemento
      const newSupplement = await repositories.supplement.create(supplementData);
      
      // Actualizar contrato para reflejar que tiene suplementos
      await this.contractRepository.update(contractId, { 
        hasSupplements: true,
        updatedAt: new Date(),
        lastModifiedBy: userId
      });
      
      // Invalidar caches relacionados
      await this.cacheService.invalidatePattern(`contracts:*`);
      await this.cacheService.invalidate(`contract:${contractId}`);
      
      LoggingService.info('Supplement created', { 
        supplementId: newSupplement.id, 
        contractId, 
        userId 
      });
      
      return newSupplement;
    } catch (error) {
      LoggingService.error('Error creating supplement', {
        contractId,
        userId,
        error: error.message,
      });
      this._handleError(error);
    }
  }
  
  /**
   * Actualiza un suplemento existente
   * @param {String} id - ID del suplemento
   * @param {Object} data - Datos a actualizar
   * @param {String} userId - ID del usuario que actualiza
   * @param {String} userRole - Rol del usuario
   * @returns {Promise<Object>} - Suplemento actualizado
   */
  async updateSupplement(id, data, userId, userRole) {
    try {
      // Buscar el suplemento
      const supplement = await repositories.supplement.findById(id);
      if (!supplement) {
        throw new NotFoundError(`Supplement with ID ${id} not found`);
      }
      
      // Verificar que el contrato asociado existe
      const contract = await this.contractRepository.findById(supplement.contractId);
      if (!contract) {
        throw new NotFoundError(`Associated contract not found`);
      }
      
      // Validar datos básicos del suplemento
      this._validateSupplementData(data);
      
      // Preparar datos para actualizar
      const updateData = {
        name: data.name,
        description: data.description,
        effectiveDate: data.effectiveDate,
        updatedAt: new Date()
      };
      
      // Actualizar URL del documento si se proporcionó un nuevo archivo
      if (data.fileData && data.fileData.fileUrl) {
        updateData.documentUrl = data.fileData.fileUrl;
      }
      
      // Actualizar el suplemento
      const updatedSupplement = await repositories.supplement.update(id, updateData);
      
      // Invalidar caches relacionados
      await this.cacheService.invalidatePattern(`contracts:*`);
      await this.cacheService.invalidate(`contract:${supplement.contractId}`);
      
      LoggingService.info('Supplement updated', { 
        supplementId: id, 
        contractId: supplement.contractId, 
        userId 
      });
      
      return updatedSupplement;
    } catch (error) {
      LoggingService.error('Error updating supplement', {
        supplementId: id,
        userId,
        error: error.message,
      });
      this._handleError(error);
    }
  }
  
  /**
   * Elimina un suplemento
   * @param {String} id - ID del suplemento
   * @param {String} userId - ID del usuario que elimina
   * @param {String} userRole - Rol del usuario
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  async deleteSupplement(id, userId, userRole) {
    try {
      // Buscar el suplemento
      const supplement = await repositories.supplement.findById(id);
      if (!supplement) {
        throw new NotFoundError(`Supplement with ID ${id} not found`);
      }
      
      // Eliminar el suplemento (soft delete)
      await repositories.supplement.softDelete(id);
      
      // Verificar si el contrato tiene otros suplementos activos
      const activeSupplements = await repositories.supplement.findByContractId(supplement.contractId);
      
      // Si no hay más suplementos activos, actualizar el contrato
      if (activeSupplements.length === 0) {
        await this.contractRepository.update(supplement.contractId, { 
          hasSupplements: false,
          updatedAt: new Date(),
          lastModifiedBy: userId
        });
      }
      
      // Invalidar caches relacionados
      await this.cacheService.invalidatePattern(`contracts:*`);
      await this.cacheService.invalidate(`contract:${supplement.contractId}`);
      
      LoggingService.info('Supplement deleted', { 
        supplementId: id, 
        contractId: supplement.contractId, 
        userId 
      });
      
      return true;
    } catch (error) {
      LoggingService.error('Error deleting supplement', {
        supplementId: id,
        userId,
        error: error.message,
      });
      this._handleError(error);
    }
  }
  
  /**
   * Validación de datos de suplemento
   * @param {Object} data - Datos a validar
   * @private
   */
  _validateSupplementData(data) {
    // Verificar campos requeridos
    const requiredFields = ['name', 'effectiveDate'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validar fecha de efectividad
    const effectiveDate = new Date(data.effectiveDate);
    
    if (isNaN(effectiveDate.getTime())) {
      throw new ValidationError('Invalid effective date');
    }
  }

  /**
   * Obtiene estadísticas de contratos
   */
  async getContractStats(params) {
    // ... existing code ...
  }

  /**
   * Obtiene estadísticas de contratos por tipo
   */
  async getContractStatsByType(userId, role) {
    try {
      // Configurar las opciones de filtrado según el rol
      const filterOptions = {
        deletedAt: null // Excluir contratos eliminados
      };
      
      // Filtrar por usuario si no es administrador
      if (role !== 'ADMIN' && role !== 'RA') {
        filterOptions.createdBy = userId;
      }
      
      // Realizar las consultas para cada tipo de contrato
      const [clientContracts, providerContracts, otherContracts] = await Promise.all([
        // Contratos de tipo cliente
        this.prisma.contract.count({
          where: {
            ...filterOptions,
            type: 'client'
          }
        }),
        
        // Contratos de tipo proveedor
        this.prisma.contract.count({
          where: {
            ...filterOptions,
            type: 'provider'
          }
        }),
        
        // Otros tipos de contratos
        this.prisma.contract.count({
          where: {
            ...filterOptions,
            type: {
              notIn: ['client', 'provider']
            }
          }
        })
      ]);
      
      // Retornar las estadísticas
      return {
        client: clientContracts,
        provider: providerContracts,
        other: otherContracts
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas de contratos por tipo:', error);
      throw error;
    }
  }

  /**
   * Obtiene la historia de un contrato
   */
  async getContractHistory(id, userId, role) {
    // ... existing code ...
  }
}

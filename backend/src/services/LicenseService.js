import { BaseService } from './BaseService.js';
import prisma from '../database/prisma.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { LicenseValidator } from './LicenseValidatorService.js';

export class LicenseService extends BaseService {
  constructor() {
    super('license');
  }

  /**
   * Obtiene la información de la licencia actual
   * @returns {Promise<Object>} Estado de la licencia
   */
  async getCurrentLicense() {
    return await LicenseValidator.getCurrentLicenseStatus();
  }

  /**
   * Activa una licencia con la clave proporcionada
   * @param {string} licenseKey - Clave de licencia
   * @returns {Promise<Object>} Resultado de la activación
   */
  async activateLicense(licenseKey) {
    if (!licenseKey) {
      throw new ValidationError('Clave de licencia requerida');
    }

    // Verificar si la clave de licencia es un código de prueba
    const isTrial = Object.keys(LicenseValidator.TRIAL_CODES || {}).includes(licenseKey);
    
    if (isTrial) {
      // El usuario actual viene del token JWT
      const userId = this.getCurrentUserId();
      return await LicenseValidator.activateTrialWithCode(licenseKey, userId);
    }

    // Para licencias normales, validar formato
    if (!LicenseValidator.isValidLicenseKey(licenseKey)) {
      throw new ValidationError('Formato de clave de licencia inválido');
    }

    // Buscar si la licencia ya existe
    const existingLicense = await prisma.license.findUnique({
      where: { licenseKey }
    });

    if (existingLicense && existingLicense.active) {
      throw new ValidationError('Esta licencia ya está activada');
    }

    // Crear o actualizar la licencia
    const license = await prisma.license.upsert({
      where: { licenseKey },
      update: { active: true },
      create: {
        licenseKey,
        type: 'FULL',
        active: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        features: ['BASIC', 'REPORTS', 'ANALYTICS', 'EXPORT'],
        metadata: {
          activationDate: new Date().toISOString()
        }
      }
    });

    // Registrar actividad
    await this.logActivity('LICENSE_ACTIVATION', 'License', license.id, 'Licencia activada');

    return {
      success: true,
      message: 'Licencia activada correctamente',
      license
    };
  }

  /**
   * Desactiva una licencia
   * @param {string} id - ID de la licencia
   * @returns {Promise<Object>} Resultado de la desactivación
   */
  async deactivateLicense(id) {
    const license = await prisma.license.findUnique({
      where: { id }
    });

    if (!license) {
      throw new NotFoundError('Licencia no encontrada');
    }

    if (!license.active) {
      throw new ValidationError('Esta licencia ya está desactivada');
    }

    const updatedLicense = await prisma.license.update({
      where: { id },
      data: { active: false }
    });

    // Registrar actividad
    await this.logActivity('LICENSE_DEACTIVATION', 'License', id, 'Licencia desactivada');

    return {
      success: true,
      message: 'Licencia desactivada correctamente',
      license: updatedLicense
    };
  }

  /**
   * Obtiene el historial de licencias
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Historial de licencias paginado
   */
  async getLicenseHistory(filters = {}) {
    const { page = 1, limit = 10, ...rest } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    
    // Aplicar filtros adicionales si existen
    if (rest.type) where.type = rest.type;
    if (rest.active !== undefined) where.active = rest.active === 'true';

    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.license.count({ where })
    ]);

    return {
      data: licenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Valida una licencia
   * @param {string} licenseKey - Clave de licencia
   * @returns {Promise<Object>} Resultado de la validación
   */
  async validateLicense(licenseKey) {
    if (!licenseKey) {
      throw new ValidationError('Clave de licencia requerida');
    }

    // Verificar formato
    if (!LicenseValidator.isValidLicenseKey(licenseKey)) {
      return {
        isValid: false,
        message: 'Formato de clave de licencia inválido'
      };
    }

    // Buscar licencia
    const license = await prisma.license.findUnique({
      where: { licenseKey }
    });

    if (!license) {
      return {
        isValid: false,
        message: 'Licencia no encontrada'
      };
    }

    if (!license.active) {
      return {
        isValid: false,
        message: 'Licencia inactiva',
        license
      };
    }

    if (license.expiryDate < new Date()) {
      return {
        isValid: false,
        message: 'Licencia expirada',
        license
      };
    }

    return {
      isValid: true,
      message: 'Licencia válida',
      license
    };
  }

  /**
   * Obtiene una licencia por su ID
   * @param {string} id - ID de la licencia
   * @returns {Promise<Object>} Licencia encontrada
   */
  async getLicenseById(id) {
    if (!id) {
      throw new ValidationError('ID de licencia requerido');
    }

    const license = await prisma.license.findUnique({
      where: { id }
    });

    if (!license) {
      throw new NotFoundError('Licencia no encontrada');
    }

    return license;
  }

  /**
   * Crea una nueva licencia
   * @param {Object} data - Datos de la licencia
   * @returns {Promise<Object>} Licencia creada
   */
  async createLicense(data) {
    if (!data) {
      throw new ValidationError('Datos de licencia requeridos');
    }

    // Generar clave de licencia si no se proporciona
    if (!data.licenseKey) {
      data.licenseKey = LicenseValidator.generateLicenseKey();
    }

    // Validar formato de la clave
    if (!LicenseValidator.isValidLicenseKey(data.licenseKey)) {
      throw new ValidationError('Formato de clave de licencia inválido');
    }

    // Verificar si ya existe
    const existingLicense = await prisma.license.findUnique({
      where: { licenseKey: data.licenseKey }
    });

    if (existingLicense) {
      throw new ValidationError('Esta clave de licencia ya existe');
    }

    // Valores por defecto
    const licenseData = {
      licenseKey: data.licenseKey,
      type: data.type || 'FULL',
      active: data.active !== undefined ? data.active : true,
      expiryDate: data.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
      features: data.features || ['BASIC', 'REPORTS', 'ANALYTICS', 'EXPORT'],
      metadata: {
        creationDate: new Date().toISOString(),
        ...data.metadata
      }
    };

    const license = await prisma.license.create({
      data: licenseData
    });

    // Registrar actividad
    await this.logActivity('LICENSE_CREATION', 'License', license.id, 'Licencia creada');

    return license;
  }

  /**
   * Actualiza una licencia existente
   * @param {string} id - ID de la licencia
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Licencia actualizada
   */
  async updateLicense(id, data) {
    if (!id) {
      throw new ValidationError('ID de licencia requerido');
    }

    // Verificar que la licencia existe
    const license = await prisma.license.findUnique({
      where: { id }
    });

    if (!license) {
      throw new NotFoundError('Licencia no encontrada');
    }

    // Preparar datos de actualización
    const updateData = {
      ...data,
      metadata: {
        ...license.metadata,
        ...data.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    // Actualizar
    const updatedLicense = await prisma.license.update({
      where: { id },
      data: updateData
    });

    // Registrar actividad
    await this.logActivity('LICENSE_UPDATE', 'License', id, 'Licencia actualizada');

    return updatedLicense;
  }

  /**
   * Elimina una licencia
   * @param {string} id - ID de la licencia
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async deleteLicense(id) {
    if (!id) {
      throw new ValidationError('ID de licencia requerido');
    }

    // Verificar que la licencia existe
    const license = await prisma.license.findUnique({
      where: { id }
    });

    if (!license) {
      throw new NotFoundError('Licencia no encontrada');
    }

    // Eliminar
    await prisma.license.delete({
      where: { id }
    });

    // Registrar actividad
    await this.logActivity('LICENSE_DELETION', 'License', id, 'Licencia eliminada');

    return true;
  }

  /**
   * Genera una nueva clave de licencia
   * @param {Object} data - Datos para la generación
   * @returns {Promise<Object>} Clave generada y datos
   */
  async generateLicenseKey(data = {}) {
    const licenseKey = LicenseValidator.generateLicenseKey();
    
    // Si se proporcionan datos, crear la licencia
    if (Object.keys(data).length > 0) {
      const license = await this.createLicense({
        ...data,
        licenseKey,
        active: false // Por defecto inactiva hasta que se active
      });
      
      return {
        licenseKey,
        license
      };
    }
    
    return {
      licenseKey,
      message: 'Clave de licencia generada correctamente'
    };
  }

  /**
   * Obtiene el ID del usuario actual
   * @returns {string} ID del usuario
   */
  getCurrentUserId() {
    // En una implementación real, esto vendría del contexto de la solicitud
    // Por ahora, retornamos un ID predeterminado o de un administrador
    return process.env.DEFAULT_ADMIN_ID || '1';
  }

  /**
   * Registra una actividad
   * @param {string} action - Acción realizada
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {string} details - Detalles adicionales
   */
  async logActivity(action, entityType, entityId, details) {
    try {
      await prisma.activityLog.create({
        data: {
          userId: this.getCurrentUserId(),
          action,
          entityType,
          entityId,
          details
        }
      });
    } catch (error) {
      console.error('Error al registrar actividad:', error);
    }
  }
} 
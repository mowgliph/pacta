import { BasePrismaRepository } from './BasePrismaRepository.js';
import prisma from '../prisma.js';
import { LoggingService } from '../../services/LoggingService.js';

/**
 * Repositorio para gestionar suplementos de contratos usando Prisma
 */
export class SupplementPrismaRepository extends BasePrismaRepository {
  constructor() {
    super('supplement');
    this.logger = new LoggingService('SupplementPrismaRepository');
  }

  /**
   * Encuentra suplementos por ID de contrato
   * @param {string} contractId - ID del contrato
   * @returns {Promise<Array>} - Lista de suplementos
   */
  async findByContractId(contractId) {
    try {
      const supplements = await prisma.supplement.findMany({
        where: {
          contractId,
          deletedAt: null
        },
        orderBy: {
          effectiveDate: 'desc'
        }
      });
      return supplements;
    } catch (error) {
      this.logger.error('Error finding supplements by contract ID', { contractId, error: error.message });
      throw error;
    }
  }

  /**
   * Encuentra un suplemento por su ID
   * @param {string} id - ID del suplemento
   * @returns {Promise<Object|null>} - Suplemento encontrado o null
   */
  async findById(id) {
    try {
      const supplement = await prisma.supplement.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });
      return supplement;
    } catch (error) {
      this.logger.error('Error finding supplement by ID', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Crea un nuevo suplemento
   * @param {Object} data - Datos del suplemento
   * @returns {Promise<Object>} - Suplemento creado
   */
  async create(data) {
    try {
      const supplement = await prisma.supplement.create({
        data: {
          ...data,
          createdAt: new Date()
        }
      });
      return supplement;
    } catch (error) {
      this.logger.error('Error creating supplement', { data, error: error.message });
      throw error;
    }
  }

  /**
   * Actualiza un suplemento existente
   * @param {string} id - ID del suplemento
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Suplemento actualizado
   */
  async update(id, data) {
    try {
      const supplement = await prisma.supplement.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
      return supplement;
    } catch (error) {
      this.logger.error('Error updating supplement', { id, data, error: error.message });
      throw error;
    }
  }

  /**
   * Elimina un suplemento (soft delete)
   * @param {string} id - ID del suplemento
   * @returns {Promise<Object>} - Suplemento eliminado
   */
  async softDelete(id) {
    try {
      const supplement = await prisma.supplement.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });
      return supplement;
    } catch (error) {
      this.logger.error('Error soft deleting supplement', { id, error: error.message });
      throw error;
    }
  }
  
  /**
   * Cuenta suplementos por contrato
   * @param {string} contractId - ID del contrato
   * @returns {Promise<number>} - Número de suplementos
   */
  async countByContractId(contractId) {
    try {
      const count = await prisma.supplement.count({
        where: {
          contractId,
          deletedAt: null
        }
      });
      return count;
    } catch (error) {
      this.logger.error('Error counting supplements by contract ID', { contractId, error: error.message });
      throw error;
    }
  }
}

export default new SupplementPrismaRepository(); 
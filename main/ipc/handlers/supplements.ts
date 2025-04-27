import { IPC_CHANNELS } from '../../utils/constants';
import { withErrorHandling } from '../setup';
import { SupplementService } from '../../services/supplement.service';
import { ErrorHandler } from '../error-handler';
import { z } from 'zod';
import { logger } from '../../utils/logger';

// Esquemas de validación
const supplementCreateSchema = z.object({
  contractId: z.string().uuid(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  changes: z.string(),
  effectiveDate: z.string().datetime(),
});

const supplementUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  changes: z.string().optional(),
  effectiveDate: z.string().datetime().optional(),
});

/**
 * Configura los manejadores IPC para suplementos de contratos
 */
export function setupSupplementHandlers(): void {
  logger.info('Configurando manejadores IPC para suplementos');

  // Obtener todos los suplementos de un contrato
  withErrorHandling(IPC_CHANNELS.SUPPLEMENTS_GET_BY_CONTRACT, async (_, contractId: string) => {
    try {
      if (!contractId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del contrato es requerido');
      }
      
      return await SupplementService.getContractSupplements(contractId);
    } catch (error) {
      logger.error(`Error al obtener suplementos del contrato ${contractId}:`, error);
      throw error;
    }
  });

  // Obtener un suplemento por ID
  withErrorHandling(IPC_CHANNELS.SUPPLEMENTS_GET_BY_ID, async (_, supplementId: string) => {
    try {
      if (!supplementId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del suplemento es requerido');
      }
      
      const supplement = await SupplementService.getSupplementById(supplementId);
      
      if (!supplement) {
        throw ErrorHandler.createError('NotFoundError', 'Suplemento no encontrado');
      }
      
      return supplement;
    } catch (error) {
      logger.error(`Error al obtener suplemento ${supplementId}:`, error);
      throw error;
    }
  });

  // Crear un nuevo suplemento
  withErrorHandling(IPC_CHANNELS.SUPPLEMENTS_CREATE, async (_, supplementData) => {
    try {
      // Validar datos con Zod
      const validatedData = supplementCreateSchema.parse(supplementData);
      
      // Crear suplemento
      const newSupplement = await SupplementService.createSupplement(validatedData, supplementData.userId);
      
      logger.info(`Suplemento creado: ${newSupplement.id} para contrato ${newSupplement.contractId}`);
      return newSupplement;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Error de validación al crear suplemento:', validationErrors);
        throw ErrorHandler.createError(
          'ValidationError',
          `Error de validación: ${validationErrors[0].message}`,
          validationErrors
        );
      }
      
      logger.error('Error al crear suplemento:', error);
      throw error;
    }
  });

  // Actualizar un suplemento
  withErrorHandling(IPC_CHANNELS.SUPPLEMENTS_UPDATE, async (_, updateData) => {
    try {
      // Validar datos con Zod
      const validatedData = supplementUpdateSchema.parse(updateData);
      
      // Actualizar suplemento
      const updatedSupplement = await SupplementService.updateSupplement(
        validatedData.id,
        validatedData
      );
      
      if (!updatedSupplement) {
        throw ErrorHandler.createError('NotFoundError', 'Suplemento no encontrado');
      }
      
      logger.info(`Suplemento actualizado: ${updatedSupplement.id}`);
      return updatedSupplement;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Error de validación al actualizar suplemento:', validationErrors);
        throw ErrorHandler.createError(
          'ValidationError',
          `Error de validación: ${validationErrors[0].message}`,
          validationErrors
        );
      }
      
      logger.error('Error al actualizar suplemento:', error);
      throw error;
    }
  });

  // Aprobar un suplemento
  withErrorHandling(IPC_CHANNELS.SUPPLEMENTS_APPROVE, async (_, supplementId: string, userId: string) => {
    try {
      if (!supplementId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del suplemento es requerido');
      }
      
      if (!userId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del usuario es requerido');
      }
      
      const approvedSupplement = await SupplementService.approveSupplement(supplementId, userId);
      
      logger.info(`Suplemento aprobado: ${supplementId} por usuario ${userId}`);
      return approvedSupplement;
    } catch (error) {
      logger.error(`Error al aprobar suplemento ${supplementId}:`, error);
      throw error;
    }
  });

  // Eliminar un suplemento
  withErrorHandling(IPC_CHANNELS.SUPPLEMENTS_DELETE, async (_, supplementId: string, userId: string) => {
    try {
      if (!supplementId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del suplemento es requerido');
      }
      
      if (!userId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del usuario es requerido');
      }
      
      // Verificar permisos del usuario (esto ya se hace en el servicio)
      const result = await SupplementService.deleteSupplement(supplementId, userId);
      
      logger.info(`Suplemento eliminado: ${supplementId} por usuario ${userId}`);
      return result;
      
    } catch (error) {
      logger.error(`Error al eliminar suplemento ${supplementId}:`, error);
      throw error;
    }
  });
} 
import { withErrorHandling } from '../setup';
import { IpcErrorHandler } from '../error-handler';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { DocumentService } from '../../services/document.service';
import { z } from 'zod';

// Esquemas de validación para documentos
const documentMetadataSchema = z.object({
  fileName: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  description: z.string().optional(),
  contractId: z.string().uuid().optional(),
  supplementId: z.string().uuid().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

/**
 * Configurar manejadores IPC para documentos
 */
export function setupDocumentHandlers(): void {
  logger.info('Configurando manejadores IPC para documentos');

  // Subir documento
  withErrorHandling('documents:upload', async (_, fileData, metadata, userId) => {
    try {
      // Validar metadata con Zod
      const validatedMetadata = documentMetadataSchema.parse(metadata);
      
      // Validar que al menos uno de contractId o supplementId esté presente
      if (!validatedMetadata.contractId && !validatedMetadata.supplementId) {
        throw IpcErrorHandler.createError(
          'ValidationError', 
          'Se requiere al menos contractId o supplementId'
        );
      }
      
      // Validar que userId está presente
      if (!userId) {
        throw IpcErrorHandler.createError(
          'ValidationError', 
          'Se requiere el ID del usuario'
        );
      }
      
      // Validar que fileData está presente
      if (!fileData || !fileData.buffer) {
        throw IpcErrorHandler.createError(
          'ValidationError', 
          'Los datos del archivo son requeridos'
        );
      }
      
      // Procesar y guardar el documento
      const savedDocument = await DocumentService.saveDocument({
        buffer: Buffer.from(fileData.buffer),
        originalname: validatedMetadata.originalName,
        mimetype: validatedMetadata.mimeType,
        size: validatedMetadata.size,
      }, validatedMetadata, userId);
      
      logger.info(`Documento subido: ${savedDocument.id}`);
      return savedDocument;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Error de validación al subir documento:', validationErrors);
        throw IpcErrorHandler.createError(
          'ValidationError',
          `Error de validación: ${validationErrors[0].message}`,
          validationErrors
        );
      }
      
      logger.error('Error al subir documento:', error);
      throw error;
    }
  });

  // Obtener documento por ID
  withErrorHandling('documents:getById', async (_, documentId) => {
    try {
      if (!documentId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del documento es requerido');
      }
      
      const document = await DocumentService.getDocumentById(documentId);
      
      if (!document) {
        throw IpcErrorHandler.createError('NotFoundError', 'Documento no encontrado');
      }
      
      return document;
    } catch (error) {
      logger.error(`Error al obtener documento ${documentId}:`, error);
      throw error;
    }
  });

  // Obtener documentos de un contrato
  withErrorHandling('documents:getByContract', async (_, contractId) => {
    try {
      if (!contractId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del contrato es requerido');
      }
      
      return await DocumentService.getDocumentsByContract(contractId);
    } catch (error) {
      logger.error(`Error al obtener documentos del contrato ${contractId}:`, error);
      throw error;
    }
  });

  // Obtener documentos de un suplemento
  withErrorHandling('documents:getBySupplement', async (_, supplementId) => {
    try {
      if (!supplementId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del suplemento es requerido');
      }
      
      return await DocumentService.getDocumentsBySupplement(supplementId);
    } catch (error) {
      logger.error(`Error al obtener documentos del suplemento ${supplementId}:`, error);
      throw error;
    }
  });

  // Eliminar documento
  withErrorHandling('documents:delete', async (_, documentId, userId) => {
    try {
      if (!documentId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del documento es requerido');
      }
      
      if (!userId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del usuario es requerido');
      }
      
      const success = await DocumentService.deleteDocument(documentId, userId);
      
      if (!success) {
        throw IpcErrorHandler.createError('NotFoundError', 'Documento no encontrado o sin permisos');
      }
      
      logger.info(`Documento eliminado: ${documentId} por usuario ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error al eliminar documento ${documentId}:`, error);
      throw error;
    }
  });

  // Actualizar metadata de documento
  withErrorHandling('documents:updateMetadata', async (_, documentId, metadata, userId) => {
    try {
      if (!documentId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del documento es requerido');
      }
      
      if (!userId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del usuario es requerido');
      }
      
      const updatedDocument = await DocumentService.updateDocumentMetadata(documentId, metadata, userId);
      
      if (!updatedDocument) {
        throw IpcErrorHandler.createError('NotFoundError', 'Documento no encontrado o sin permisos');
      }
      
      logger.info(`Metadata de documento actualizada: ${documentId}`);
      return updatedDocument;
    } catch (error) {
      logger.error(`Error al actualizar metadata de documento ${documentId}:`, error);
      throw error;
    }
  });
  
  // Descargar documento
  withErrorHandling('documents:download', async (_, documentId, userId) => {
    try {
      if (!documentId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del documento es requerido');
      }
      
      if (!userId) {
        throw IpcErrorHandler.createError('ValidationError', 'El ID del usuario es requerido');
      }
      
      const fileData = await DocumentService.getDocumentFile(documentId, userId);
      
      if (!fileData) {
        throw IpcErrorHandler.createError('NotFoundError', 'Documento no encontrado o sin permisos');
      }
      
      logger.info(`Documento descargado: ${documentId} por usuario ${userId}`);
      return fileData;
    } catch (error) {
      logger.error(`Error al descargar documento ${documentId}:`, error);
      throw error;
    }
  });
} 
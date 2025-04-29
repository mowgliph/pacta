import { withErrorHandling } from '../setup';
import { ErrorHandler } from '../error-handler';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { DocumentsChannels } from '../channels/documents.channels';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';

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

// Clase de servicio para documentos
class DocumentService {
  static async saveDocument(fileData, metadata, userId) {
    try {
      // Validar que al menos uno de contractId o supplementId esté presente
      if (!metadata.contractId && !metadata.supplementId) {
        throw new Error('Se requiere al menos contractId o supplementId');
      }

      // Crear directorio para documentos si no existe
      const userDataPath = app.getPath('userData');
      const documentsDir = path.join(userDataPath, 'documents');
      await fs.mkdir(documentsDir, { recursive: true });

      // Crear nombre de archivo seguro usando hash y extensión original
      const fileExt = path.extname(metadata.originalName);
      const hash = crypto
        .createHash('md5')
        .update(`${metadata.originalName}-${Date.now()}`)
        .digest('hex');
      const safeFileName = `${hash}${fileExt}`;
      const filePath = path.join(documentsDir, safeFileName);

      // Guardar archivo
      await fs.writeFile(filePath, fileData.buffer);

      // Crear registro en base de datos
      const document = await prisma.document.create({
        data: {
          filename: safeFileName,
          originalName: metadata.originalName,
          mimeType: metadata.mimeType,
          size: metadata.size,
          path: filePath,
          description: metadata.description,
          tags: metadata.tags ? metadata.tags.join(',') : null,
          isPublic: metadata.isPublic,
          uploadedById: userId,
          contractId: metadata.contractId,
          supplementId: metadata.supplementId,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return document;
    } catch (error) {
      logger.error('Error al guardar documento:', error);
      throw error;
    }
  }

  static async getDocumentById(id) {
    return await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  static async getDocumentsByContract(contractId) {
    return await prisma.document.findMany({
      where: { contractId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  static async getDocumentsBySupplement(supplementId) {
    return await prisma.document.findMany({
      where: { supplementId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  static async deleteDocument(id, userId) {
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return false;
    }

    // Eliminar archivo físico
    try {
      await fs.unlink(document.path);
    } catch (error) {
      logger.warn(`No se pudo eliminar el archivo físico: ${document.path}`, error);
    }

    // Eliminar registro
    await prisma.document.delete({
      where: { id }
    });

    return true;
  }

  static async updateDocumentMetadata(id, metadata, userId) {
    return await prisma.document.update({
      where: { id },
      data: {
        description: metadata.description,
        tags: metadata.tags ? metadata.tags.join(',') : undefined,
        isPublic: metadata.isPublic
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  static async getDocumentFile(id, userId) {
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return null;
    }

    // Incrementar contador de descargas
    await prisma.document.update({
      where: { id },
      data: {
        downloads: { increment: 1 }
      }
    });

    // Leer el archivo
    const fileBuffer = await fs.readFile(document.path);
    
    return {
      buffer: fileBuffer,
      filename: document.originalName,
      mimeType: document.mimeType
    };
  }
}

/**
 * Configurar manejadores IPC para documentos
 */
export function setupDocumentHandlers(): void {
  logger.info('Configurando manejadores IPC para documentos');

  // Subir documento
  withErrorHandling(DocumentsChannels.SAVE, async (_, fileData, metadata, userId) => {
    try {
      // Validar metadata con Zod
      const validatedMetadata = documentMetadataSchema.parse(metadata);
      
      // Validar que al menos uno de contractId o supplementId esté presente
      if (!validatedMetadata.contractId && !validatedMetadata.supplementId) {
        throw ErrorHandler.createError(
          'ValidationError', 
          'Se requiere al menos contractId o supplementId'
        );
      }
      
      // Validar que userId está presente
      if (!userId) {
        throw ErrorHandler.createError(
          'ValidationError', 
          'Se requiere el ID del usuario'
        );
      }
      
      // Validar que fileData está presente
      if (!fileData || !fileData.buffer) {
        throw ErrorHandler.createError(
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
        throw ErrorHandler.createError(
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
  withErrorHandling(DocumentsChannels.GET_BY_ID, async (_, documentId) => {
    try {
      if (!documentId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del documento es requerido');
      }
      
      const document = await DocumentService.getDocumentById(documentId);
      
      if (!document) {
        throw ErrorHandler.createError('NotFoundError', 'Documento no encontrado');
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
        throw ErrorHandler.createError('ValidationError', 'El ID del contrato es requerido');
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
        throw ErrorHandler.createError('ValidationError', 'El ID del suplemento es requerido');
      }
      
      return await DocumentService.getDocumentsBySupplement(supplementId);
    } catch (error) {
      logger.error(`Error al obtener documentos del suplemento ${supplementId}:`, error);
      throw error;
    }
  });

  // Eliminar documento
  withErrorHandling(DocumentsChannels.DELETE, async (_, documentId, userId) => {
    try {
      if (!documentId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del documento es requerido');
      }
      
      if (!userId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del usuario es requerido');
      }
      
      const success = await DocumentService.deleteDocument(documentId, userId);
      
      if (!success) {
        throw ErrorHandler.createError('NotFoundError', 'Documento no encontrado o sin permisos');
      }
      
      logger.info(`Documento eliminado: ${documentId} por usuario ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error al eliminar documento ${documentId}:`, error);
      throw error;
    }
  });

  // Actualizar metadata de documento
  withErrorHandling(DocumentsChannels.UPDATE, async (_, documentId, metadata, userId) => {
    try {
      if (!documentId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del documento es requerido');
      }
      
      if (!userId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del usuario es requerido');
      }
      
      const updatedDocument = await DocumentService.updateDocumentMetadata(documentId, metadata, userId);
      
      if (!updatedDocument) {
        throw ErrorHandler.createError('NotFoundError', 'Documento no encontrado o sin permisos');
      }
      
      logger.info(`Metadata de documento actualizada: ${documentId}`);
      return updatedDocument;
    } catch (error) {
      logger.error(`Error al actualizar metadata de documento ${documentId}:`, error);
      throw error;
    }
  });
  
  // Descargar documento
  withErrorHandling(DocumentsChannels.DOWNLOAD, async (_, documentId, userId) => {
    try {
      if (!documentId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del documento es requerido');
      }
      
      if (!userId) {
        throw ErrorHandler.createError('ValidationError', 'El ID del usuario es requerido');
      }
      
      const fileData = await DocumentService.getDocumentFile(documentId, userId);
      
      if (!fileData) {
        throw ErrorHandler.createError('NotFoundError', 'Documento no encontrado o sin permisos');
      }
      
      logger.info(`Documento descargado: ${documentId} por usuario ${userId}`);
      return fileData;
    } catch (error) {
      logger.error(`Error al descargar documento ${documentId}:`, error);
      throw error;
    }
  });
} 
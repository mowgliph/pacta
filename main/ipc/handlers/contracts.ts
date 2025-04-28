import { prisma } from '../../lib/prisma';
import { withErrorHandling } from '../setup';
import { logger } from '../../utils/logger';
import { ContractService } from '../../services/contract.service';
import { ContractsChannels } from '../channels/contracts.channels';
import { z } from 'zod';
import { ErrorHandler } from '../error-handler';

// Esquemas de validación
const contractFilterSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const createContractSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : undefined),
  status: z.string().default('draft'),
  amount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  parties: z.array(z.object({
    name: z.string(),
    role: z.string(),
    contact: z.string().optional(),
  })).optional(),
  tags: z.string().optional(),
  createdById: z.string().uuid(),
  metadata: z.record(z.any()).optional(),
});

const updateContractSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    startDate: z.string().or(z.date()).transform((val) => val ? new Date(val) : undefined).optional(),
    endDate: z.string().or(z.date()).transform((val) => val ? new Date(val) : undefined).optional(),
    status: z.string().optional(),
    amount: z.number().nonnegative().optional(),
    currency: z.string().length(3).optional(),
    tags: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    updatedById: z.string().uuid(),
  }),
});

export function setupContractHandlers(): void {
  // Obtener todos los contratos
  withErrorHandling(ContractsChannels.GET_ALL, async (_, filters) => {
    try {
      // Validar filtros
      const validatedFilters = contractFilterSchema.parse(filters);
      
      const { type, status, search, page, limit, sortBy, sortOrder } = validatedFilters;
      
      // Construir condiciones de consulta
      const where = {
        ...(type && { type }),
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      // Construir ordenación
      const orderBy = sortBy 
        ? { [sortBy]: sortOrder }
        : { createdAt: sortOrder };

      // Ejecutar consulta principal con paginación
      const [contracts, total] = await Promise.all([
        prisma.contract.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            parties: true,
            supplements: {
              select: {
                id: true,
                title: true,
                effectiveDate: true,
                status: true,
                changeType: true
              }
            }
          }
        }),
        prisma.contract.count({ where })
      ]);

      logger.info(`Contratos recuperados: ${contracts.length} de ${total}`);

      // Formato de respuesta con metadatos de paginación
      return {
        data: contracts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Error de validación en filtros de contratos:', error.errors);
        throw ErrorHandler.createError('ValidationError', 'Filtros de búsqueda inválidos');
      }
      throw error;
    }
  });

  // Obtener un contrato por ID
  withErrorHandling(ContractsChannels.GET_BY_ID, async (_, { id, includeDocuments = false }) => {
    try {
      // Validar ID
      if (!id || typeof id !== 'string') {
        throw ErrorHandler.createError('ValidationError', 'ID de contrato no válido');
      }

      // Definir relaciones a incluir
      const include = {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parties: true,
        supplements: true,
        history: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      };

      // Incluir documentos si se solicita
      if (includeDocuments) {
        include['documents'] = true;
      }

      // Buscar contrato con relaciones
      const contract = await prisma.contract.findUnique({
        where: { id },
        include
      });

      if (!contract) {
        throw ErrorHandler.createError('NotFoundError', 'Contrato no encontrado');
      }

      logger.info(`Contrato recuperado: ${id}`);
      return { contract };
    } catch (error) {
      if (error.type === 'NotFoundError' || error.type === 'ValidationError') {
        throw error;
      }
      logger.error(`Error al obtener contrato ${id}:`, error);
      throw ErrorHandler.createError('UnknownError', 'Error al recuperar el contrato');
    }
  });

  // Crear un nuevo contrato
  withErrorHandling(ContractsChannels.CREATE, async (_, contractData) => {
    try {
      // Validar datos
      const validatedData = createContractSchema.parse(contractData);
      
      // Extraer parties si existen
      const { parties, ...contractInfo } = validatedData;
      
      // Crear contrato con Prisma
      const contract = await prisma.contract.create({
        data: {
          ...contractInfo,
          // Crear relaciones de partes si se proporcionaron
          ...(parties && {
            parties: {
              create: parties
            }
          }),
          // Crear registro de historial
          history: {
            create: {
              action: 'CREATE',
              userId: contractInfo.createdById,
              entityType: 'Contract',
              details: 'Contrato creado'
            }
          }
        },
        include: {
          parties: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info(`Contrato creado: ${contract.id} - ${contract.title}`);
      return { 
        success: true, 
        contract,
        message: 'Contrato creado exitosamente' 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Error de validación al crear contrato:', error.errors);
        throw ErrorHandler.createError('ValidationError', 'Datos de contrato inválidos', error.format());
      }
      logger.error('Error al crear contrato:', error);
      throw ErrorHandler.createError('DatabaseError', 'Error al crear el contrato');
    }
  });

  // Actualizar un contrato
  withErrorHandling(ContractsChannels.UPDATE, async (_, payload) => {
    try {
      // Validar datos
      const { id, data } = updateContractSchema.parse(payload);
      
      // Guardar ID de usuario para historial
      const { updatedById } = data;
      
      // Buscar contrato existente para verificar
      const existingContract = await prisma.contract.findUnique({
        where: { id },
        select: { id: true, title: true }
      });
      
      if (!existingContract) {
        throw ErrorHandler.createError('NotFoundError', 'Contrato no encontrado');
      }
      
      // Actualizar contrato
      const contract = await prisma.contract.update({
        where: { id },
        data: {
          ...data,
          // Crear registro de historial
          history: {
            create: {
              action: 'UPDATE',
              userId: updatedById,
              entityType: 'Contract',
              details: `Contrato "${existingContract.title}" actualizado`,
              changes: JSON.stringify(data)
            }
          }
        },
        include: {
          parties: true,
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      logger.info(`Contrato actualizado: ${id}`);
      return { 
        success: true, 
        contract,
        message: 'Contrato actualizado exitosamente' 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Error de validación al actualizar contrato:', error.errors);
        throw ErrorHandler.createError('ValidationError', 'Datos de actualización inválidos', error.format());
      }
      if (error.type === 'NotFoundError') {
        throw error;
      }
      logger.error(`Error al actualizar contrato:`, error);
      throw ErrorHandler.createError('DatabaseError', 'Error al actualizar el contrato');
    }
  });

  // Eliminar un contrato
  withErrorHandling(ContractsChannels.DELETE, async (_, { id, userId }) => {
    try {
      // Validar ID
      if (!id || typeof id !== 'string' || !userId) {
        throw ErrorHandler.createError('ValidationError', 'ID de contrato y usuario son requeridos');
      }

      // Iniciar transacción para operación atómica
      await prisma.$transaction(async (tx) => {
        // Eliminar partes relacionadas
        await tx.contractParty.deleteMany({
          where: { contractId: id }
        });
        
        // Eliminar historial
        await tx.historyRecord.deleteMany({
          where: { 
            entityId: id,
            entityType: 'Contract'
          }
        });
        
        // Eliminar contrato
        await tx.contract.delete({
          where: { id }
        });
      });

      // Crear registro de historial independiente
      await prisma.historyRecord.create({
        data: {
          action: 'DELETE',
          userId,
          entityType: 'Contract',
          entityId: id,
          details: 'Contrato eliminado'
        }
      });

      logger.info(`Contrato eliminado: ${id}`);
      return { 
        success: true, 
        message: 'Contrato eliminado exitosamente' 
      };
    } catch (error) {
      if (error.type === 'ValidationError') {
        throw error;
      }
      if (error.code === 'P2025') {
        throw ErrorHandler.createError('NotFoundError', 'Contrato no encontrado');
      }
      logger.error(`Error al eliminar contrato ${id}:`, error);
      throw ErrorHandler.createError('DatabaseError', 'Error al eliminar el contrato');
    }
  });

  // Actualizar control de acceso de un contrato
  withErrorHandling(ContractsChannels.UPDATE_ACCESS, async (_, { id, accessControl, userId, userRole }) => {
    try {
      if (!id || !userId) {
        throw ErrorHandler.createError('ValidationError', 'ID de contrato y usuario son requeridos');
      }
      
      const result = await ContractService.updateContractAccessControl(
        id, 
        accessControl, 
        userId, 
        userRole
      );
      
      logger.info(`Control de acceso actualizado para contrato: ${id}`);
      return {
        success: true,
        ...result,
        message: 'Control de acceso actualizado'
      };
    } catch (error) {
      logger.error(`Error al actualizar control de acceso para contrato ${id}:`, error);
      throw error;
    }
  });

  // Asignar usuarios a un contrato
  withErrorHandling(ContractsChannels.ASSIGN_USERS, async (_, { id, userAssignments, userId, userRole }) => {
    try {
      if (!id || !userId || !userAssignments) {
        throw ErrorHandler.createError('ValidationError', 'Datos incompletos para asignación de usuarios');
      }
      
      const result = await ContractService.assignUsersToContract(
        id, 
        userAssignments, 
        userId, 
        userRole
      );
      
      logger.info(`Usuarios asignados a contrato: ${id}`);
      return {
        success: true,
        ...result,
        message: 'Usuarios asignados correctamente'
      };
    } catch (error) {
      logger.error(`Error al asignar usuarios a contrato ${id}:`, error);
      throw error;
    }
  });
} 
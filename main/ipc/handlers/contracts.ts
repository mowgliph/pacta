import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../utils/constants';
import { prisma } from '../../lib/prisma';
import { withErrorHandling } from '../setup';
import { logger } from '../../utils/logger';
import { ContractService } from '../../services/contractService';

export function setupContractHandlers(): void {
  // Obtener todos los contratos
  withErrorHandling(IPC_CHANNELS.CONTRACTS_GET_ALL, async (_, filters) => {
    const { type, status, search, page = 1, limit = 10 } = filters;
    
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

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: {
            select: {
              name: true,
              email: true
            }
          },
          supplements: {
            select: {
              id: true,
              title: true,
              effectiveDate: true
            }
          }
        }
      }),
      prisma.contract.count({ where })
    ]);

    return {
      data: contracts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  });

  // Obtener un contrato por ID
  withErrorHandling(IPC_CHANNELS.CONTRACTS_GET_BY_ID, async (_, id) => {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        supplements: true,
        history: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!contract) {
      throw new Error('Contrato no encontrado');
    }

    return contract;
  });

  // Crear un nuevo contrato
  withErrorHandling(IPC_CHANNELS.CONTRACTS_CREATE, async (_, data) => {
    const contract = await prisma.contract.create({
      data: {
        ...data,
        history: {
          create: {
            action: 'CREATE',
            userId: data.createdById,
            entityType: 'Contract'
          }
        }
      }
    });

    logger.info(`Contrato creado: ${contract.id}`);
    return contract;
  });

  // Actualizar un contrato
  withErrorHandling(IPC_CHANNELS.CONTRACTS_UPDATE, async (_, { id, data }) => {
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        ...data,
        history: {
          create: {
            action: 'UPDATE',
            userId: data.updatedById,
            entityType: 'Contract',
            changes: JSON.stringify(data)
          }
        }
      }
    });

    logger.info(`Contrato actualizado: ${id}`);
    return contract;
  });

  // Eliminar un contrato
  withErrorHandling(IPC_CHANNELS.CONTRACTS_DELETE, async (_, { id, userId }) => {
    await prisma.contract.delete({
      where: { id }
    });

    await prisma.historyRecord.create({
      data: {
        action: 'DELETE',
        userId,
        entityType: 'Contract',
        entityId: id
      }
    });

    logger.info(`Contrato eliminado: ${id}`);
    return { success: true };
  });

  // Actualizar control de acceso de un contrato
  withErrorHandling('contracts:updateAccessControl', async (_, { id, accessControl, userId, userRole }) => {
    try {
      const result = await ContractService.updateContractAccessControl(
        id, 
        accessControl, 
        userId || 'system', 
        userRole
      );
      logger.info(`Control de acceso actualizado para contrato: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error al actualizar control de acceso para contrato ${id}:`, error);
      throw error;
    }
  });

  // Asignar usuarios a un contrato
  withErrorHandling('contracts:assignUsers', async (_, { id, userAssignments, userId, userRole }) => {
    try {
      const result = await ContractService.assignUsersToContract(
        id, 
        userAssignments, 
        userId || 'system', 
        userRole
      );
      logger.info(`Usuarios asignados a contrato: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error al asignar usuarios a contrato ${id}:`, error);
      throw error;
    }
  });
} 
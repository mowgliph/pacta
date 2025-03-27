import { prisma } from '../../database/prisma.js';
import fs from 'fs';
import { logger } from '../../utils/logger.js';
import { ValidationService } from '../../services/ValidationService.js';
import { ValidationError } from '../../utils/errors.js';

// Instanciar el servicio de validación
const validationService = new ValidationService();

// Obtener todos los contratos (filtrados por rol de usuario)
export const getAllContracts = async (req, res) => {
  try {
    // Validar parámetros de consulta
    const validatedQuery = await validationService.validateContractSearch(req.query);

    const filter = {};
    const pagination = {
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit,
    };

    // Aplicar filtros opcionales de estados
    if (validatedQuery.status) {
      filter.status = validatedQuery.status;
    }

    // Aplicar filtros de fechas
    if (validatedQuery.startDateFrom || validatedQuery.startDateTo) {
      filter.startDate = {};
      if (validatedQuery.startDateFrom) {
        filter.startDate.gte = new Date(validatedQuery.startDateFrom);
      }
      if (validatedQuery.startDateTo) {
        filter.startDate.lte = new Date(validatedQuery.startDateTo);
      }
    }

    // Aplicar orden
    const orderBy = {};
    if (validatedQuery.sortBy) {
      orderBy[validatedQuery.sortBy] = validatedQuery.sortDirection || 'asc';
    } else {
      orderBy.updatedAt = 'desc';
    }

    const contracts = await prisma.contract.findMany({
      where: filter,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: true,
        department: true,
        contractTags: true,
      },
      orderBy,
      ...pagination,
    });

    // Obtener conteo total para paginación
    const totalContracts = await prisma.contract.count({
      where: filter,
    });

    res.json({
      status: 'success',
      data: contracts,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: totalContracts,
        totalPages: Math.ceil(totalContracts / validatedQuery.limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching contracts:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de búsqueda inválidos',
        errors: error.details,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los contratos',
    });
  }
};

// Obtener contrato por ID
export const getContractById = async (req, res) => {
  try {
    // Validar ID
    const { id } = await validationService.validateContractId({ id: req.params.id });

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: true,
        department: true,
        contractTags: true,
      },
    });

    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contrato no encontrado',
      });
    }

    res.json({
      status: 'success',
      data: contract,
    });
  } catch (error) {
    logger.error('Error fetching contract:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de contrato inválido',
        errors: error.details,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el contrato',
    });
  }
};

// Crear nuevo contrato
export const createContract = async (req, res) => {
  try {
    // Validar datos del contrato
    const validatedData = await validationService.validateContractCreation(req.body);

    const contract = await prisma.contract.create({
      data: {
        ...validatedData,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: true,
        department: true,
        contractTags: true,
      },
    });

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'CONTRACT',
        entityId: contract.id,
        details: 'Creación de nuevo contrato',
      },
    });

    res.status(201).json({
      status: 'success',
      data: contract,
    });
  } catch (error) {
    logger.error('Error creating contract:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de contrato inválidos',
        errors: error.details,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error al crear el contrato',
    });
  }
};

// Actualizar contrato
export const updateContract = async (req, res) => {
  try {
    // Validar ID
    const { id } = await validationService.validateContractId({ id: req.params.id });

    // Validar datos de actualización
    const validatedData = await validationService.validateContractUpdate(req.body);

    const contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contrato no encontrado',
      });
    }

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: validatedData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: true,
        department: true,
        contractTags: true,
      },
    });

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'CONTRACT',
        entityId: updatedContract.id,
        details: 'Actualización de contrato',
      },
    });

    res.json({
      status: 'success',
      data: updatedContract,
    });
  } catch (error) {
    logger.error('Error updating contract:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de contrato inválidos',
        errors: error.details,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el contrato',
    });
  }
};

// Eliminar contrato (soft delete)
export const deleteContract = async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contrato no encontrado',
      });
    }

    await prisma.contract.update({
      where: { id: parseInt(req.params.id) },
      data: { deletedAt: new Date() },
    });

    // Registrar actividad
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'CONTRACT',
        entityId: contract.id,
        details: 'Eliminación de contrato',
      },
    });

    res.json({
      status: 'success',
      message: 'Contrato eliminado correctamente',
    });
  } catch (error) {
    logger.error('Error deleting contract:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar el contrato',
    });
  }
};

// Obtener documento del contrato
export const getContractDocument = async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { authorId: req.user.id }),
      },
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }

    if (!contract.documentPath) {
      return res.status(404).json({ message: 'El contrato no tiene documento asociado' });
    }

    if (!fs.existsSync(contract.documentPath)) {
      return res.status(404).json({ message: 'El documento no se encuentra en el servidor' });
    }

    // Registrar actividad
    await prisma.activity.create({
      data: {
        action: 'VIEW_CONTRACT_DOCUMENT',
        description: `Documento del contrato ${contract.title} visualizado`,
        userId: req.user.id,
        contractId: contract.id,
      },
    });

    res.download(contract.documentPath);
  } catch (error) {
    console.error('Error getting contract document:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener el documento del contrato', error: error.message });
  }
};

// Búsqueda avanzada con filtros
export const searchContracts = async (req, res) => {
  try {
    const {
      title,
      contractNumber,
      status,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      minAmount,
      maxAmount,
      currency,
      searchQuery,
    } = req.body;

    const where = req.user.role === 'admin' ? {} : { authorId: req.user.id };

    // Filtro de título
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    // Filtro de número de contrato
    if (contractNumber) {
      where.contractNumber = { contains: contractNumber, mode: 'insensitive' };
    }

    // Filtro de estado
    if (status) {
      if (Array.isArray(status) && status.length > 0) {
        where.status = { in: status };
      } else if (typeof status === 'string') {
        where.status = status;
      }
    }

    // Filtros de fecha de inicio
    if (startDateFrom || startDateTo) {
      where.startDate = {
        gte: startDateFrom ? new Date(startDateFrom) : undefined,
        lte: startDateTo ? new Date(startDateTo) : undefined,
      };
    }

    // Filtros de fecha de fin
    if (endDateFrom || endDateTo) {
      where.endDate = {
        gte: endDateFrom ? new Date(endDateFrom) : undefined,
        lte: endDateTo ? new Date(endDateTo) : undefined,
      };
    }

    // Filtros de importe
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {
        gte: minAmount,
        lte: maxAmount,
      };
    }

    // Filtro de moneda
    if (currency) {
      where.currency = currency;
    }

    // Búsqueda general
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { contractNumber: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json(contracts);
  } catch (error) {
    console.error('Error searching contracts:', error);
    res.status(500).json({ message: 'Error al buscar contratos', error: error.message });
  }
};

// Obtener estadísticas de contratos
export const getContractStatistics = async (req, res) => {
  try {
    const today = new Date();

    // Consultar todos los contratos del usuario o todos si es admin
    const contracts = await prisma.contract.findMany({
      where: req.user.role === 'admin' ? {} : { authorId: req.user.id },
    });

    // Estadísticas básicas
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;

    // Contratos próximos a vencer (dentro del período de notificación)
    const expiringContracts = contracts.filter(c => {
      if (c.status !== 'active') {
        return false;
      }

      const daysUntilExpiry = Math.ceil(
        (new Date(c.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysUntilExpiry <= c.notificationDays && daysUntilExpiry > 0;
    }).length;

    // Contratos expirados
    const expiredContracts = contracts.filter(c => {
      if (c.status === 'expired') {
        return true;
      }
      if (c.status === 'active' && new Date(c.endDate) < today) {
        return true;
      }
      return false;
    }).length;

    // Calcular valores totales por moneda
    const totalByCurrency = contracts.reduce((acc, contract) => {
      const currency = contract.currency;
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += parseFloat(contract.amount);
      return acc;
    }, {});

    // Contar por estado
    const statusCounts = contracts.reduce(
      (acc, contract) => {
        if (!acc[contract.status]) acc[contract.status] = 0;
        acc[contract.status]++;
        return acc;
      },
      { active: 0, expired: 0, draft: 0, terminated: 0, renewed: 0 },
    );

    // Contratos recientes
    const recentContracts = contracts
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    res.json({
      stats: {
        totalContracts,
        activeContracts,
        expiringContracts,
        expiredContracts,
        totalByCurrency,
      },
      statusCounts,
      recentContracts,
    });
  } catch (error) {
    console.error('Error getting contract statistics:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener estadísticas de contratos', error: error.message });
  }
};

// Cambiar estado de un contrato
export const changeContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar que el estado sea válido
    const validStatuses = ['draft', 'active', 'expired', 'terminated', 'renewed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const contract = await prisma.contract.findUnique({
      where: {
        id,
        ...(req.user.role !== 'admin' && { authorId: req.user.id }),
      },
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status,
        lastModifiedBy: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: true,
        department: true,
      },
    });

    // Registrar actividad
    await prisma.activity.create({
      data: {
        action: 'UPDATE_CONTRACT_STATUS',
        description: `Estado del contrato ${updatedContract.title} cambiado a ${status}`,
        userId: req.user.id,
        contractId: updatedContract.id,
      },
    });

    res.json(updatedContract);
  } catch (error) {
    console.error('Error changing contract status:', error);
    res
      .status(500)
      .json({ message: 'Error al cambiar el estado del contrato', error: error.message });
  }
};

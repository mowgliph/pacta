import { prisma } from '../../database/prisma.js';
import fs from 'fs';
import { Op } from 'sequelize';
import { db } from '../database/dbconnection.js';

// Obtener todos los contratos (filtrados por rol de usuario)
export const getAllContracts = async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      where: req.user.role === 'admin' ? {} : { authorId: req.user.id },
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
    console.error('Error fetching contracts:', error);
    res.status(500).json({ message: 'Error al obtener los contratos', error: error.message });
  }
};

// Obtener contrato por ID
export const getContractById = async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { authorId: req.user.id }),
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
        contractTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ message: 'Error al obtener el contrato', error: error.message });
  }
};

// Crear nuevo contrato
export const createContract = async (req, res) => {
  try {
    const contract = await prisma.contract.create({
      data: {
        ...req.body,
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
      },
    });

    // Registrar actividad
    await prisma.activity.create({
      data: {
        action: 'CREATE_CONTRACT',
        description: `Contrato ${contract.title} creado`,
        userId: req.user.id,
        contractId: contract.id,
      },
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Error al crear el contrato', error: error.message });
  }
};

// Actualizar contrato
export const updateContract = async (req, res) => {
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

    const updatedContract = await prisma.contract.update({
      where: { id: req.params.id },
      data: req.body,
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
        action: 'UPDATE_CONTRACT',
        description: `Contrato ${updatedContract.title} actualizado`,
        userId: req.user.id,
        contractId: updatedContract.id,
      },
    });

    res.json(updatedContract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ message: 'Error al actualizar el contrato', error: error.message });
  }
};

// Eliminar contrato (soft delete)
export const deleteContract = async (req, res) => {
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

    await prisma.contract.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    // Registrar actividad
    await prisma.activity.create({
      data: {
        action: 'DELETE_CONTRACT',
        description: `Contrato ${contract.title} eliminado`,
        userId: req.user.id,
        contractId: contract.id,
      },
    });

    res.json({ message: 'Contrato eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ message: 'Error al eliminar el contrato', error: error.message });
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

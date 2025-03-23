import { Contract, User, License, ActivityLog } from '../models/index.js';
import { Op } from 'sequelize';
import fs from 'fs';
import { db } from '../database/dbconnection.js';

// Obtener todos los contratos (filtrados por rol de usuario)
export const getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        },
        {
          model: License,
          attributes: ['name', 'type']
        }
      ],
      order: [['updatedAt', 'DESC']]
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
    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { createdBy: req.user.id })
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'modifier',
          attributes: ['id', 'username', 'email']
        },
        {
          model: License,
          attributes: ['name', 'type']
        }
      ]
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
    const contractData = {
      ...req.body,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    };

    // Si se ha subido un documento, guardar la ruta
    if (req.file) {
      contractData.documentPath = req.file.path;
    }

    const contract = await Contract.create(contractData);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'Contract',
      entityId: contract.id,
      details: `Contrato ${contract.contractNumber} creado`
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
    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { createdBy: req.user.id })
      }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }

    // Guardamos la ruta del documento anterior por si hay que eliminarla
    const oldDocumentPath = contract.documentPath;

    // Preparamos los datos a actualizar
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };

    // Si se ha subido un nuevo documento, actualizamos la ruta
    if (req.file) {
      updateData.documentPath = req.file.path;
    }

    await contract.update(updateData);

    // Si se ha subido un nuevo documento y existía uno anterior, lo eliminamos
    if (req.file && oldDocumentPath && fs.existsSync(oldDocumentPath)) {
      fs.unlinkSync(oldDocumentPath);
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entityType: 'Contract',
      entityId: contract.id,
      details: `Contrato ${contract.contractNumber} actualizado`
    });

    res.json(contract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ message: 'Error al actualizar el contrato', error: error.message });
  }
};

// Eliminar contrato
export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { createdBy: req.user.id })
      }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }

    // Guardamos información del contrato para el log
    const contractInfo = {
      id: contract.id,
      contractNumber: contract.contractNumber,
      title: contract.title
    };

    // Si el contrato tiene un documento asociado, lo eliminamos
    if (contract.documentPath && fs.existsSync(contract.documentPath)) {
      fs.unlinkSync(contract.documentPath);
    }

    await contract.destroy();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entityType: 'Contract',
      entityId: contractInfo.id,
      details: `Contrato ${contractInfo.contractNumber} eliminado`
    });

    res.json({ 
      message: 'Contrato eliminado correctamente',
      contract: contractInfo
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ message: 'Error al eliminar el contrato', error: error.message });
  }
};

// Obtener documento del contrato
export const getContractDocument = async (req, res) => {
  try {
    const contract = await Contract.findOne({
      where: {
        id: req.params.id,
        ...(req.user.role !== 'admin' && { createdBy: req.user.id })
      }
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

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'VIEW',
      entityType: 'Contract_Document',
      entityId: contract.id,
      details: `Documento del contrato ${contract.contractNumber} visualizado`
    });

    res.download(contract.documentPath);
  } catch (error) {
    console.error('Error getting contract document:', error);
    res.status(500).json({ message: 'Error al obtener el documento del contrato', error: error.message });
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
      searchQuery
    } = req.body;

    const where = req.user.role === 'admin' ? {} : { createdBy: req.user.id };

    // Filtro de título
    if (title) {
      where.title = { [Op.iLike]: `%${title}%` };
    }

    // Filtro de número de contrato
    if (contractNumber) {
      where.contractNumber = { [Op.iLike]: `%${contractNumber}%` };
    }

    // Filtro de estado
    if (status) {
      if (Array.isArray(status) && status.length > 0) {
        where.status = { [Op.in]: status };
      } else if (typeof status === 'string') {
        where.status = status;
      }
    }

    // Filtros de fecha de inicio
    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate[Op.gte] = new Date(startDateFrom);
      }
      if (startDateTo) {
        where.startDate[Op.lte] = new Date(startDateTo);
      }
    }

    // Filtros de fecha de fin
    if (endDateFrom || endDateTo) {
      where.endDate = {};
      if (endDateFrom) {
        where.endDate[Op.gte] = new Date(endDateFrom);
      }
      if (endDateTo) {
        where.endDate[Op.lte] = new Date(endDateTo);
      }
    }

    // Filtros de importe
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount[Op.gte] = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount[Op.lte] = maxAmount;
      }
    }

    // Filtro de moneda
    if (currency) {
      where.currency = currency;
    }

    // Búsqueda general
    if (searchQuery) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${searchQuery}%` } },
        { contractNumber: { [Op.iLike]: `%${searchQuery}%` } },
        { description: { [Op.iLike]: `%${searchQuery}%` } }
      ];
    }

    const contracts = await Contract.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['username', 'email']
        },
        {
          model: License,
          attributes: ['name', 'type']
        }
      ],
      order: [['updatedAt', 'DESC']]
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
    const sequelize = db.sequelize;
    const today = new Date();

    // Consultar todos los contratos del usuario o todos si es admin
    const contracts = await Contract.findAll({
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id }
    });

    // Estadísticas básicas
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    
    // Contratos próximos a vencer (dentro del período de notificación)
    const expiringContracts = contracts.filter(c => {
      if (c.status !== 'active') return false;
      
      const daysUntilExpiry = Math.ceil(
        (new Date(c.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= c.notificationDays && daysUntilExpiry > 0;
    }).length;
    
    // Contratos expirados
    const expiredContracts = contracts.filter(c => 
      c.status === 'expired' || (c.status === 'active' && new Date(c.endDate) < today)
    ).length;

    // Calcular valores totales por moneda
    const totalByCurrency = contracts.reduce((acc, contract) => {
      const currency = contract.currency;
      if (!acc[currency]) acc[currency] = 0;
      acc[currency] += parseFloat(contract.amount);
      return acc;
    }, {});

    // Contar por estado
    const statusCounts = contracts.reduce((acc, contract) => {
      if (!acc[contract.status]) acc[contract.status] = 0;
      acc[contract.status]++;
      return acc;
    }, { active: 0, expired: 0, draft: 0, terminated: 0, renewed: 0 });

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
        totalByCurrency
      },
      statusCounts,
      recentContracts
    });
  } catch (error) {
    console.error('Error getting contract statistics:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de contratos', error: error.message });
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
    
    const contract = await Contract.findOne({
      where: {
        id,
        ...(req.user.role !== 'admin' && { createdBy: req.user.id })
      }
    });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }
    
    // Actualizar solo el estado y lastModifiedBy
    await contract.update({ 
      status, 
      lastModifiedBy: req.user.id 
    });
    
    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'UPDATE_STATUS',
      entityType: 'Contract',
      entityId: contract.id,
      details: `Estado del contrato ${contract.contractNumber} cambiado a ${status}`
    });
    
    res.json(contract);
  } catch (error) {
    console.error('Error changing contract status:', error);
    res.status(500).json({ message: 'Error al cambiar el estado del contrato', error: error.message });
  }
}; 
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// GET / - Obtener datos estadísticos
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // --- Calcular Estadísticas --- 
    
    // 1. Contadores Totales y por Estado
    const totalContracts = await prisma.contract.count();
    const contractsByStatus = await prisma.contract.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });
    // Formatear countsByStatus para que sea más fácil de usar en el frontend
    const statusCounts = contractsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {}); // Ej: { Active: 10, Pending: 5, Expired: 2 }

    // 2. Contratos Próximos a Vencer (Contador y Lista)
    const today = new Date();
    // Resetear hora a 00:00:00 para evitar problemas con la comparación de fechas
    today.setHours(0, 0, 0, 0);
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);
    
    const expiringSoonWhere = {
        endDate: {
          gte: today,       
          lte: next30Days,  
        },
        status: 'Active' 
    };

    const expiringSoonCount = await prisma.contract.count({ where: expiringSoonWhere });

    // Nueva consulta: Obtener los detalles de los próximos 5 a vencer
    const expiringContracts = await prisma.contract.findMany({
        where: expiringSoonWhere,
        orderBy: {
            endDate: 'asc' // Los más cercanos primero
        },
        take: 5, // Limitar a 5
        select: { // Seleccionar solo los campos necesarios
            id: true,
            name: true,
            endDate: true
        }
    });

    // 3. Actividad Reciente (Suplementos)
    // Asume un modelo 'Activity' con relación a 'Contract' y un campo 'action' o similar
    // O podría basarse en el modelo 'Supplement' si tiene fecha de creación/modificación
    const recentSupplementsActivity = await prisma.activity.findMany({
        where: {
            // Filtrar por acciones relacionadas a suplementos
            // Ajusta estos valores según tu lógica de 'action'
            action: {
                in: ['CREATE_SUPPLEMENT', 'UPDATE_SUPPLEMENT'] 
            }
        },
        orderBy: {
            createdAt: 'desc' // Los más recientes primero
        },
        take: 5, // Limitar a 5
        select: {
            id: true,
            description: true, // O el campo relevante que describa la acción
            createdAt: true, // La fecha de la actividad
            contract: { // Incluir datos del contrato asociado
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    
    // Formatear para el frontend (opcional pero recomendado)
    const recentSupplements = recentSupplementsActivity.map(activity => ({
        id: activity.id,
        description: activity.description || 'Actividad registrada', 
        date: activity.createdAt,
        contractId: activity.contract.id,
        contractName: activity.contract.name || `ID ${activity.contract.id}`
    }));

    // --- Ensamblar Respuesta --- 
    const statisticsData = {
      totalContracts,
      statusCounts, 
      expiringSoonCount,
      expiringContracts, 
      recentSupplements, // Añadir la lista de actividades
    };

    res.json(statisticsData);

  } catch (error) {
    console.error("Error calculating statistics:", error);
    res.status(500).json({ message: 'Error al calcular las estadísticas', error: error.message });
  }
});

module.exports = router; 
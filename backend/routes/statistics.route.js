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

    // 2. Contratos Próximos a Vencer (ej. próximos 30 días)
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    
    const expiringSoonCount = await prisma.contract.count({
      where: {
        endDate: {
          gte: today,       // Mayor o igual a hoy
          lte: next30Days,  // Menor o igual a dentro de 30 días
        },
        status: 'Active' // Solo considerar contratos activos
      },
    });

    // 3. (Opcional) Podrías añadir más estadísticas aquí:
    //    - Valor total de contratos (si tuvieras un campo 'value')
    //    - Contratos por tipo (si el campo 'type' se usa consistentemente)
    //    - Actividad reciente (basado en el modelo Activity)

    // --- Ensamblar Respuesta --- 
    const statisticsData = {
      totalContracts,
      statusCounts, 
      expiringSoonCount,
      // Añadir otras estadísticas aquí
    };

    res.json(statisticsData);

  } catch (error) {
    console.error("Error calculating statistics:", error);
    res.status(500).json({ message: 'Error al calcular las estadísticas', error: error.message });
  }
});

module.exports = router; 
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/public/statistics - Obtener estadísticas públicas
router.get('/statistics', async (req, res) => {
  try {
    // Obtener estadísticas básicas para el dashboard público
    const totalContracts = await prisma.contract.count();
    const activeContracts = await prisma.contract.count({
      where: { status: 'Active' }
    });
    const expiringContracts = await prisma.contract.count({
      where: {
        status: 'Active',
        endDate: {
          lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Próximos 30 días
        }
      }
    });

    // Datos de ejemplo/demostración
    const demoStats = {
      totalContracts,
      activeContracts,
      expiringContracts,
      chartData: {
        monthly: [
          { month: 'Ene', contratos: 5 },
          { month: 'Feb', contratos: 8 },
          { month: 'Mar', contratos: 12 },
          { month: 'Abr', contratos: 7 }
        ],
        byType: [
          { type: 'Cliente', count: Math.floor(totalContracts * 0.6) },
          { type: 'Proveedor', count: Math.floor(totalContracts * 0.4) }
        ]
      }
    };

    res.json(demoStats);
  } catch (error) {
    console.error('Error obteniendo estadísticas públicas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

// GET /api/public/contracts - Obtener lista de contratos públicos (demo)
router.get('/contracts', async (req, res) => {
  try {
    // Obtener una muestra limitada de contratos para demostración
    const demoContracts = await prisma.contract.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        type: true,
        startDate: true,
        endDate: true,
        status: true,
        // Excluir campos sensibles
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(demoContracts);
  } catch (error) {
    console.error('Error obteniendo contratos públicos:', error);
    res.status(500).json({ message: 'Error al obtener contratos' });
  }
});

// GET /api/public/dashboard-data - Obtener datos combinados para el dashboard público
router.get('/dashboard-data', async (req, res) => {
  try {
    const [statistics, recentContracts] = await Promise.all([
      prisma.contract.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: 'Active',
        },
      }),
      prisma.contract.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          type: true,
          startDate: true,
          endDate: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // Combinar datos para el dashboard
    const dashboardData = {
      statistics: {
        total: statistics._count.id,
        activePercentage: 75, // Dato de ejemplo
        efficiency: 89, // Dato de ejemplo
      },
      recentActivity: recentContracts,
      charts: {
        monthly: [
          { month: 'Ene', contratos: 5 },
          { month: 'Feb', contratos: 8 },
          { month: 'Mar', contratos: 12 },
          { month: 'Abr', contratos: 7 }
        ]
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error obteniendo datos del dashboard público:', error);
    res.status(500).json({ message: 'Error al obtener datos del dashboard' });
  }
});

module.exports = router;
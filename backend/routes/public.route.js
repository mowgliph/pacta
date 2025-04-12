const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @route GET /api/public/statistics
 * @desc Obtiene estadísticas públicas para el dashboard
 * @access Public
 */
router.get('/statistics', async (req, res) => {
  try {
    // Obtener estadísticas de contratos
    const totalContracts = await prisma.contract.count();
    const activeContracts = await prisma.contract.count({
      where: { status: 'Active' }
    });
    
    // Obtener contratos que vencen en los próximos 30 días
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringContracts = await prisma.contract.count({
      where: {
        endDate: {
          lte: thirtyDaysFromNow,
          gt: new Date()
        },
        status: 'Active'
      }
    });
    
    // Obtener estadísticas mensuales de contratos
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await prisma.contract.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        _all: true
      }
    });
    
    // Formatear estadísticas mensuales
    const contractStats = monthlyStats.map(stat => ({
      month: new Date(stat.createdAt).toLocaleString('es-ES', { month: 'short' }),
      activos: stat._count._all,
      vencidos: 0 // Esto debería calcularse basado en la fecha de vencimiento
    }));
    
    res.json({
      totalContracts,
      activeContracts,
      expiringContracts,
      contractStats
    });
  } catch (error) {
    console.error('Error en /api/public/statistics:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas públicas',
      error: error.message 
    });
  }
});

module.exports = router; 
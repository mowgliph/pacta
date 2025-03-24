import { User, Contract, License, ActivityLog } from '../models/index.js';

export async function getDashboardData(req, res) {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days, 10);

    // Fecha actual y fecha límite para el filtro
    const now = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysNum);

    // Estadísticas de contratos
    const contracts = await Contract.findAll({
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id },
    });

    // Calcular estadísticas
    const activeContracts = contracts.filter(c => new Date(c.endDate) > now);
    const expiredContracts = contracts.filter(c => new Date(c.endDate) <= now);

    // Contratos próximos a vencer (30 días)
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    const expiringSoonContracts = activeContracts.filter(c => {
      const endDate = new Date(c.endDate);
      return endDate <= thirtyDaysFromNow;
    });

    // Nuevos contratos en el período
    const newContractsInPeriod = contracts.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= fromDate;
    });

    // Nuevos contratos hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newContractsToday = contracts.filter(c => {
      const createdDate = new Date(c.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    });

    // Nuevos contratos esta semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newContractsThisWeek = contracts.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= weekAgo;
    });

    // Revisiones pendientes y renovaciones pendientes
    const reviewPendingContracts = contracts.filter(c => c.status === 'REVIEW_PENDING');
    const renewalPendingContracts = contracts.filter(c => c.renewalStatus === 'PENDING');

    // Obtener información de licencia del usuario
    const user = await User.findByPk(req.user.id, {
      include: [{ model: License, as: 'license' }],
    });

    // Información de usuarios (solo para admin)
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.findAll();
    }

    // Categorías de contratos
    const contractTypes = {};
    contracts.forEach(contract => {
      const type = contract.type || 'Sin categoría';
      if (!contractTypes[type]) {
        contractTypes[type] = 0;
      }
      contractTypes[type]++;
    });

    // Formatear categorías
    const contractCategories = Object.entries(contractTypes).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / contracts.length) * 100),
    }));

    // Obtener actividades recientes (10 más recientes)
    const activities = await ActivityLog.findAll({
      where: req.user.role === 'admin' ? {} : { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: User, attributes: ['username'] }],
    });

    // Formatear actividades para la respuesta
    const recentActivities = activities.map(activity => {
      let icon = 'fas fa-clipboard-list';
      let color = '#4a90e2';

      switch (activity.action) {
        case 'CREATE':
          icon = 'fas fa-plus-circle';
          color = '#50c878';
          break;
        case 'UPDATE':
          icon = 'fas fa-edit';
          color = '#f39c12';
          break;
        case 'DELETE':
          icon = 'fas fa-trash-alt';
          color = '#e74c3c';
          break;
        case 'LOGIN':
          icon = 'fas fa-sign-in-alt';
          color = '#9b59b6';
          break;
      }

      return {
        id: activity.id,
        title: activity.User ? `${activity.User.username} ${activity.details}` : activity.details,
        time: activity.createdAt,
        icon,
        color,
        type: activity.action.toLowerCase(),
      };
    });

    // Construir la respuesta
    const response = {
      contractStats: {
        total: contracts.length,
        active: activeContracts.length,
        expired: expiredContracts.length,
        expiringSoon: expiringSoonContracts.length,
        newInPeriod: newContractsInPeriod.length,
      },
      license: user.license
        ? {
            status: user.license.active ? 'Licencia Activa' : 'Licencia Inactiva',
            expiryDate: user.license.expiryDate,
            type: user.license.type,
            remainingDays: Math.ceil(
              (new Date(user.license.expiryDate) - now) / (1000 * 60 * 60 * 24),
            ),
            registeredCompanies: new Set(contracts.map(c => c.companyId)).size,
            activeUsers: users.length,
          }
        : null,
      contractTrends: {
        newToday: newContractsToday.length,
        newThisWeek: newContractsThisWeek.length,
        reviewPending: reviewPendingContracts.length,
        renewalsPending: renewalPendingContracts.length,
      },
      contractCategories,
      recentActivities,
    };

    res.json(response);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error retrieving dashboard data' });
  }
}

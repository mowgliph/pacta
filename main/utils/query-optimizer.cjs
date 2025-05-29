const { prisma } = require("./prisma.cjs");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ACTIVE_STATUSES = ['VIGENTE', 'ACTIVO'];
const EXPIRING_STATUSES = ['VIGENTE', 'ACTIVO'];
const EXPIRED_STATUS = 'VENCIDO';

exports.QueryOptimizer = class QueryOptimizer {
  async getDashboardStatistics() {
    console.log("[QueryOptimizer] Iniciando getDashboardStatistics");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    thirtyDaysLater.setHours(23, 59, 59, 999);
    const todayStr = today.toISOString();
    const thirtyDaysLaterStr = thirtyDaysLater.toISOString();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const totalContracts = await prisma.contract.count({ where: { isArchived: false } });
      if (totalContracts === 0) {
        return {
          totals: { total: 0, active: 0, expiring: 0, expired: 0, archived: 0 },
          trends: {
            total: { value: 0, label: "vs mes anterior", positive: true },
            active: { value: 0, label: "vs mes anterior", positive: true },
            expiring: { value: 0, label: "próximo mes", positive: false },
            expired: { value: 0, label: "este mes", positive: false },
          },
          distribution: { client: 0, supplier: 0 },
          recentActivity: [],
        };
      }
      // Contratos activos
      const activeContracts = await prisma.contract.count({
        where: {
          status: { in: ACTIVE_STATUSES },
          isArchived: false,
          OR: [
            { endDate: { gte: todayStr } },
            { endDate: null }
          ]
        }
      });
      // Contratos próximos a vencer
      const expiringContracts = await prisma.contract.count({
        where: {
          status: { in: EXPIRING_STATUSES },
          isArchived: false,
          endDate: {
            gte: todayStr,
            lte: thirtyDaysLaterStr
          }
        }
      });
      // Contratos vencidos
      const expiredContracts = await prisma.contract.count({
        where: {
          status: EXPIRED_STATUS,
          isArchived: false,
          endDate: { lt: todayStr }
        }
      });
      // Otros datos en paralelo
      const [archivedContracts, clientContracts, supplierContracts, recentActivity] = await Promise.all([
        prisma.contract.count({ where: { isArchived: true } }),
        prisma.contract.count({ where: { type: "Cliente", isArchived: false } }),
        prisma.contract.count({ where: { type: "Proveedor", isArchived: false } }),
        prisma.contract.findMany({
          take: 10,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            contractNumber: true,
            updatedAt: true,
            createdBy: { select: { name: true } },
          },
        }),
      ]);
      const formattedRecentActivity = recentActivity.map((contract) => ({
        id: contract.id,
        title: `Contrato ${contract.contractNumber}`,
        description: `Actualizado por ${contract.createdBy?.name || "Usuario desconocido"}`,
        date: contract.updatedAt.toISOString(),
        type: "contract",
        user: {
          name: contract.createdBy?.name || "Usuario desconocido",
          avatar: undefined,
        },
      }));
      if (
        typeof totalContracts === 'undefined' ||
        typeof activeContracts === 'undefined' ||
        typeof expiringContracts === 'undefined' ||
        typeof expiredContracts === 'undefined' ||
        typeof archivedContracts === 'undefined' ||
        typeof clientContracts === 'undefined' ||
        typeof supplierContracts === 'undefined' ||
        !Array.isArray(formattedRecentActivity)
      ) {
        throw new Error('Datos incompletos al generar estadísticas del dashboard');
      }
      let lastMonthStats;
      try {
        lastMonthStats = await this.getDashboardStatisticsLastMonth();
        const calculateTrend = (current, previous) => {
          if (previous === 0) return { value: 100, label: 'sin datos previos', positive: true };
          const change = ((current - previous) / previous) * 100;
          return {
            value: Math.round(Math.abs(change)),
            label: 'vs mes anterior',
            positive: change >= 0
          };
        };
        return {
          totals: {
            total: totalContracts,
            active: activeContracts,
            expiring: expiringContracts,
            expired: expiredContracts,
            archived: archivedContracts,
          },
          trends: {
            total: calculateTrend(totalContracts, lastMonthStats.total || 0),
            active: calculateTrend(activeContracts, lastMonthStats.active || 0),
            expiring: { value: expiringContracts, label: 'próximo mes', positive: false },
            expired: { value: expiredContracts, label: 'este mes', positive: false },
          },
          distribution: {
            client: clientContracts,
            supplier: supplierContracts,
          },
          recentActivity: formattedRecentActivity,
        };
      } catch (error) {
        console.error('[Dashboard] Error al obtener estadísticas del mes anterior:', error);
        return {
          totals: {
            total: totalContracts,
            active: activeContracts,
            expiring: expiringContracts,
            expired: expiredContracts,
            archived: archivedContracts,
          },
          trends: {
            total: { value: 0, label: 'error al calcular', positive: false },
            active: { value: 0, label: 'error al calcular', positive: false },
            expiring: { value: expiringContracts, label: 'próximo mes', positive: false },
            expired: { value: expiredContracts, label: 'este mes', positive: false },
          },
          distribution: {
            client: clientContracts,
            supplier: supplierContracts,
          },
          recentActivity: formattedRecentActivity,
        };
      }
    } catch (error) {
      console.error('[Dashboard] Error crítico al obtener estadísticas:', error);
      throw new Error(`Error al generar estadísticas del dashboard: ${error.message}`);
    }
  }

  /**
   * Calcula las estadísticas del dashboard para el mes anterior, usando la misma lógica de negocio que el dashboard actual.
   * @returns {Promise<Object>} Totales del mes anterior.
   */
  async getDashboardStatisticsLastMonth() {
    // Calcular el primer y último día del mes anterior
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayLastMonth = new Date(firstDayThisMonth - 1);
    const firstDayLastMonth = new Date(
      lastDayLastMonth.getFullYear(),
      lastDayLastMonth.getMonth(),
      1
    );

    // Formato ISO para Prisma
    const start = firstDayLastMonth.toISOString();
    const end = new Date(
      lastDayLastMonth.getFullYear(),
      lastDayLastMonth.getMonth(),
      lastDayLastMonth.getDate(),
      23,
      59,
      59,
      999
    ).toISOString();

    // Total de contratos NO archivados creados hasta el último día del mes anterior
    const totalContracts = await prisma.contract.count({
      where: {
        isArchived: false,
        createdAt: { lte: end },
      },
    });

    // Contratos activos (vigentes, no archivados, endDate futuro o nulo, y creados hasta el último día del mes anterior)
    const activeContracts = await prisma.contract.count({
      where: {
        status: "Activo",
        isArchived: false,
        OR: [
          { endDate: { not: null, gte: end } },
          { endDate: null }
        ],
        createdAt: { lte: end },
      },
    });

    // Contratos próximos a vencer (endDate entre el primer y último día del mes anterior, status vigente, no archivados)
    const expiringContracts = await prisma.contract.count({
      where: {
        endDate: {
          not: null,
          gte: start,
          lte: end
        },
        status: "Vigente",
        isArchived: false,
      },
    });

    // Contratos vencidos (endDate menor al último día del mes anterior, status vigente, no archivados)
    const expiredContracts = await prisma.contract.count({
      where: {
        endDate: {
          lt: end,
        },
        status: "Vencido",
        isArchived: false,
      },
    });

    // Contratos archivados hasta el último día del mes anterior
    const archivedContracts = await prisma.contract.count({
      where: {
        isArchived: true,
        updatedAt: { lte: end },
      },
    });

    return {
      total: totalContracts || 0,
      active: activeContracts || 0,
      expiring: expiringContracts || 0,
      expired: expiredContracts || 0,
      archived: archivedContracts || 0,
    };
  }

  // Estadísticas generales de contratos
  async getContractsStats(filters) {
    // Por estado
    const byStatus = await prisma.contract.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    // Por tipo
    const byType = await prisma.contract.groupBy({
      by: ["type"],
      _count: { _all: true },
    });
    // Por mes de creación
    const byMonth = await prisma.$queryRawUnsafe(
      `SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count FROM Contract GROUP BY month ORDER BY month`
    );
    return { byStatus, byType, byMonth };
  }

  // Exportación simulada de estadísticas
  async exportStatistics(type, filters) {
    const EXPORTS_DIR = path.resolve(
      __dirname,
      "../../data/statistics/exports"
    );
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    const exportPath = path.join(
      EXPORTS_DIR,
      `estadisticas_${type}_${Date.now()}.pdf`
    );

    // Obtén los datos reales (puedes ajustar el método según el tipo)
    const stats = await this.getContractsStats(filters);

    // Crea el PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(exportPath));

    // Título
    doc.fontSize(18).text(`Estadísticas: ${type}`, { align: "center" });
    doc.moveDown();

    // Escribe los datos principales
    doc.fontSize(14).text("Por Estado:", { underline: true });
    stats.byStatus.forEach((row) => {
      doc.text(`- ${row.status}: ${row._count._all}`);
    });
    doc.moveDown();

    doc.fontSize(14).text("Por Tipo:", { underline: true });
    stats.byType.forEach((row) => {
      doc.text(`- ${row.type}: ${row._count._all}`);
    });
    doc.moveDown();

    doc.fontSize(14).text("Por Mes de Creación:", { underline: true });
    stats.byMonth.forEach((row) => {
      doc.text(`- ${row.month}: ${row.count}`);
    });

    // Finaliza el PDF
    doc.end();

    return { path: exportPath };
  }

  // Distribución de contratos por estado
  async getContractsByStatus() {
    return prisma.contract.groupBy({ by: ["status"], _count: { _all: true } });
  }
  // Distribución por tipo
  async getContractsByType() {
    return prisma.contract.groupBy({ by: ["type"], _count: { _all: true } });
  }
  // Distribución por moneda
  async getContractsByCurrency() {
    return prisma.contract.groupBy({
      by: ["currency"],
      _count: { _all: true },
    });
  }
  // Contratos por usuario
  async getContractsByUser() {
    return prisma.contract.groupBy({ by: ["ownerId"], _count: { _all: true } });
  }
  // Contratos creados por mes
  async getContractsCreatedByMonth() {
    return prisma.$queryRawUnsafe(
      `SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count FROM Contract GROUP BY month ORDER BY month`
    );
  }
  // Contratos vencidos por mes
  async getContractsExpiredByMonth() {
    return prisma.$queryRawUnsafe(
      `SELECT strftime('%Y-%m', endDate) as month, COUNT(*) as count FROM Contract WHERE status = 'Vencido' GROUP BY month ORDER BY month`
    );
  }
  // Cantidad de suplementos por contrato
  async getSupplementsCountByContract() {
    return prisma.supplement.groupBy({
      by: ["contractId"],
      _count: { _all: true },
    });
  }
  // Contratos próximos a vencer en 30 días
  async getContractsExpiringSoon() {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 30);
    return prisma.contract.findMany({
      where: { endDate: { gte: now, lte: soon }, status: "Vigente" },
      select: { id: true, contractNumber: true, endDate: true },
    });
  }
  // Contratos sin documentos adjuntos
  async getContractsWithoutDocuments() {
    return prisma.contract.findMany({
      where: { documents: { none: {} } },
      select: { id: true, contractNumber: true },
    });
  }
  // Usuarios con más actividad
  async getUsersActivity() {
    return prisma.historyRecord.groupBy({
      by: ["userId"],
      _count: { _all: true },
    });
  }
};

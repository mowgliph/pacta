const { prisma } = require("./prisma.cjs");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// Valores del enum ContractStatus definidos en el esquema de Prisma
// Estados de contrato definidos como enum en Prisma
const CONTRACT_STATUS = {
  ACTIVE: 'ACTIVO',
  EXPIRING: 'PROXIMO_A_VENCER',
  EXPIRED: 'VENCIDO',
  DRAFT: 'BORRADOR'
};

exports.QueryOptimizer = class QueryOptimizer {
  async getDashboardStatistics() {
    console.log("[QueryOptimizer] Iniciando getDashboardStatistics");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    thirtyDaysLater.setHours(23, 59, 59, 999);

    try {
      // Verificar conexión con la base de datos
      await prisma.$queryRaw`SELECT 1`;
      
      // Consulta única para obtener todos los contadores necesarios
      const [
        totalContracts,
        activeContracts,
        expiringContracts,
        expiredContracts,
        archivedContracts,
        clientContracts,
        supplierContracts,
        recentActivity
      ] = await Promise.all([
        prisma.contract.count({ 
          where: { isArchived: false } 
        }),
        prisma.contract.count({
          where: {
            AND: [
              { status: CONTRACT_STATUS.ACTIVE },
              { isArchived: false },
              { endDate: { gte: today } }
            ]
          }
        }),
        prisma.contract.count({
          where: {
            AND: [
              { status: CONTRACT_STATUS.ACTIVE },
              { isArchived: false },
              {
                endDate: {
                  gte: today,
                  lte: thirtyDaysLater
                }
              }
            ]
          }
        }),
        prisma.contract.count({
          where: {
            AND: [
              { status: CONTRACT_STATUS.EXPIRED },
              { isArchived: false },
              { endDate: { lt: today } }
            ]
          }
        }),
        prisma.contract.count({ 
          where: { isArchived: true } 
        }),
        prisma.contract.count({ 
          where: { 
            type: "Cliente", 
            isArchived: false 
          } 
        }),
        prisma.contract.count({ 
          where: { 
            type: "Proveedor", 
            isArchived: false 
          } 
        }),
        prisma.contract.findMany({
          take: 10,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            contractNumber: true,
            updatedAt: true,
            createdBy: {
              select: { 
                name: true 
              } 
            },
          },
          where: {
            isArchived: false
          }
        })
      ]);

      // Si no hay contratos, devolver estructura vacía
      if (totalContracts === 0) {
        return {
          totals: { 
            total: 0, 
            active: 0, 
            expiring: 0, 
            expired: 0, 
            archived: 0 
          },
          trends: {
            total: { value: 0, label: "vs mes anterior", positive: true },
            active: { value: 0, label: "vs mes anterior", positive: true },
            expiring: { value: 0, label: "próximo mes", positive: false },
            expired: { value: 0, label: "este mes", positive: false },
          },
          distribution: { 
            client: 0, 
            supplier: 0 
          },
          recentActivity: [],
        };
      }
      // Formatear actividad reciente
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

      // Validar datos obtenidos
      const stats = {
        total: totalContracts,
        active: activeContracts,
        expiring: expiringContracts,
        expired: expiredContracts,
        archived: archivedContracts,
        client: clientContracts,
        supplier: supplierContracts
      };

      for (const [key, value] of Object.entries(stats)) {
        if (typeof value === 'undefined') {
          throw new Error(`Dato inválido para ${key}: ${value}`);
        }
      }

      if (!Array.isArray(formattedRecentActivity)) {
        throw new Error('Formato de actividad reciente inválido');
      }

      // Obtener estadísticas del mes anterior
      let lastMonthStats;
      try {
        lastMonthStats = await this.getDashboardStatisticsLastMonth();
      } catch (error) {
        console.error('[Dashboard] Error al obtener estadísticas del mes anterior:', error);
        lastMonthStats = {}; // Usar objeto vacío para continuar con valores por defecto
      }

      // Función auxiliar para calcular tendencias
      const calculateTrend = (current, previous = 0) => {
        if (previous === 0) return { 
          value: 100, 
          label: 'sin datos previos', 
          positive: true 
        };
        const change = ((current - previous) / previous) * 100;
        return {
          value: Math.round(Math.abs(change)),
          label: 'vs mes anterior',
          positive: change >= 0
        };
      };

      // Preparar respuesta
      const response = {
        totals: {
          total: stats.total,
          active: stats.active,
          expiring: stats.expiring,
          expired: stats.expired,
          archived: stats.archived,
        },
        trends: {
          total: calculateTrend(stats.total, lastMonthStats.total),
          active: calculateTrend(stats.active, lastMonthStats.active),
          expiring: { 
            value: stats.expiring, 
            label: 'próximo mes', 
            positive: false 
          },
          expired: { 
            value: stats.expired, 
            label: 'este mes', 
            positive: false 
          },
        },
        distribution: {
          client: stats.client,
          supplier: stats.supplier,
        },
        recentActivity: formattedRecentActivity,
      };

      return response;
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
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfLastMonth = new Date(firstDayOfMonth);
      lastDayOfLastMonth.setDate(0); // Último día del mes anterior
      const firstDayOfLastMonth = new Date(lastDayOfLastMonth.getFullYear(), lastDayOfLastMonth.getMonth(), 1);
      
      // Obtener datos del mes anterior
      const [
        activeClientsLastMonth,
        activeSuppliersLastMonth,
        activeContractsLastMonth,
        expiringLastMonth
      ] = await Promise.all([
        // Contar clientes activos al final del mes anterior
        prisma.contract.count({
          where: { 
            type: 'Cliente',
            isArchived: false,
            createdAt: { lte: lastDayOfLastMonth }
          }
        }),
        
        // Contar proveedores activos al final del mes anterior
        prisma.contract.count({
          where: { 
            type: 'Proveedor',
            isArchived: false,
            createdAt: { lte: lastDayOfLastMonth }
          }
        }),
        
        // Contar contratos activos al final del mes anterior
        prisma.contract.count({
          where: { 
            status: 'ACTIVO',
            isArchived: false,
            createdAt: { lte: lastDayOfLastMonth },
            endDate: { 
              gte: lastDayOfLastMonth
            }
          }
        }),
        
        // Contar contratos que vencieron durante el mes anterior
        prisma.contract.count({
          where: {
            status: 'ACTIVO',
            isArchived: false,
            endDate: {
              gte: firstDayOfLastMonth,
              lte: lastDayOfLastMonth
            }
          }
        })
      ]);

      return {
        activeClients: activeClientsLastMonth || 0,
        activeSuppliers: activeSuppliersLastMonth || 0,
        activeContracts: activeContractsLastMonth || 0,
        expiring: expiringLastMonth || 0
      };
    } catch (error) {
      console.error('Error en getDashboardStatisticsLastMonth:', error);
      return {
        activeClients: 0,
        activeSuppliers: 0,
        activeContracts: 0,
        expiring: 0
      };
    }
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
      `SELECT strftime('%Y-%m', endDate) as month, COUNT(*) as count FROM Contract WHERE status = 'VENCIDO' GROUP BY month ORDER BY month`
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
    try {
      const now = new Date();
      const soon = new Date();
      soon.setDate(now.getDate() + 30);
      
      const contracts = await prisma.contract.findMany({
        where: { 
          endDate: { 
            gte: now, 
            lte: soon 
          },
          status: 'ACTIVO',
          isArchived: false
        },
        select: { 
          id: true, 
          contractNumber: true, 
          endDate: true,
          companyName: true,
          startDate: true
        },
        orderBy: {
          endDate: 'asc'
        }
      });
      
      return contracts || [];
    } catch (error) {
      console.error('Error en getContractsExpiringSoon:', error);
      return [];
    }
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

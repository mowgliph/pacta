const { prisma } = require("./prisma.cjs");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.QueryOptimizer = class QueryOptimizer {
  async getDashboardStatistics() {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const [
      totalContracts,
      activeContracts,
      expiringContracts,
      expiredContracts,
      clientContracts,
      supplierContracts,
      recentActivity,
    ] = await Promise.all([
      prisma.contract.count(),
      prisma.contract.count({ where: { status: "Vigente" } }),
      prisma.contract.count({
        where: {
          endDate: {
            gte: today,
            lte: thirtyDaysLater,
          },
          status: "Vigente",
        },
      }),
      prisma.contract.count({ where: { status: "Vencido" } }),
      prisma.contract.count({ where: { type: "Cliente" } }),
      prisma.contract.count({ where: { type: "Proveedor" } }),
      prisma.contract.findMany({
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          contractNumber: true,
          updatedAt: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Transformar la actividad reciente al formato esperado
    const formattedActivity = recentActivity.map((contract) => ({
      id: contract.id,
      title: `Contrato ${contract.number}`,
      contractNumber: contract.number,
      updatedAt: contract.updatedAt,
      createdBy: {
        name: contract.createdBy?.name || "Sistema",
      },
    }));

    return {
      totals: {
        total: totalContracts || 0,
        active: activeContracts || 0,
        expiring: expiringContracts || 0,
        expired: expiredContracts || 0,
      },
      distribution: {
        client: clientContracts || 0,
        supplier: supplierContracts || 0,
      },
      recentActivity: formattedActivity,
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

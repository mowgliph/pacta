const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');

class ExportUtils {
  constructor() {
    this.EXPORTS_DIR = path.resolve(__dirname, "../../data/statistics/exports");
  }

  /**
   * Exporta estadísticas a un archivo PDF
   * @param {string} type - Tipo de estadísticas a exportar
   * @param {Object} stats - Datos de estadísticas a exportar
   * @returns {Promise<Object>} - Objeto con la ruta del archivo generado
   */
  async exportStatisticsToPdf(type, stats) {
    try {
      // Asegurar que existe el directorio de exportación
      await fs.mkdir(this.EXPORTS_DIR, { recursive: true });
      
      const fileName = `estadisticas_${type}_${Date.now()}.pdf`;
      const exportPath = path.join(this.EXPORTS_DIR, fileName);

      // Crear el documento PDF
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(exportPath);
      doc.pipe(writeStream);

      // Título del documento
      doc.fontSize(18).text(`Estadísticas: ${type}`, { align: 'center' });
      doc.moveDown();

      // Sección de estadísticas por estado
      if (stats.byStatus?.length > 0) {
        doc.fontSize(14).text('Por Estado:', { underline: true });
        stats.byStatus.forEach((row) => {
          doc.text(`- ${row.status}: ${row._count._all}`);
        });
        doc.moveDown();
      }

      // Sección de estadísticas por tipo
      if (stats.byType?.length > 0) {
        doc.fontSize(14).text('Por Tipo:', { underline: true });
        stats.byType.forEach((row) => {
          doc.text(`- ${row.type}: ${row._count._all}`);
        });
        doc.moveDown();
      }

      // Sección de estadísticas por mes
      if (stats.byMonth?.length > 0) {
        doc.fontSize(14).text('Por Mes de Creación:', { underline: true });
        stats.byMonth.forEach((row) => {
          doc.text(`- ${row.month}: ${row.count}`);
        });
      }

      // Finalizar el documento
      doc.end();

      // Esperar a que se termine de escribir el archivo
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      return { 
        success: true, 
        path: exportPath,
        fileName
      };
    } catch (error) {
      console.error('[ExportUtils] Error al exportar estadísticas a PDF:', error);
      throw new Error(`Error al generar el archivo de exportación: ${error.message}`);
    }
  }
}

module.exports = new ExportUtils();

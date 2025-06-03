const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { AppError } = require("../utils/error-handler.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const ExcelJS = require('exceljs');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);

// Inicialización directa para pdfmake (PACTA/Electron)
const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");
pdfMake.vfs = pdfFonts;

const REPORT_TEMPLATES_DIR = path.join(process.cwd(), "data", "templates");

// Crear directorio de plantillas si no existe
if (!fs.existsSync(REPORT_TEMPLATES_DIR)) {
  fs.mkdirSync(REPORT_TEMPLATES_DIR, { recursive: true });
}

// Función auxiliar para guardar archivos
async function saveFile(workbook, extension) {
  const defaultPath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    "Desktop",
    `reporte_${Date.now()}.${extension}`
  );

  const result = await dialog.showSaveDialog({
    defaultPath,
    filters: [
      { name: extension.toUpperCase(), extensions: [extension] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  try {
    if (extension === "pdf") {
      const pdfBuffer = await workbook.getBuffer();
      await writeFileAsync(result.filePath, pdfBuffer);
    } else if (extension === "xlsx") {
      await workbook.xlsx.writeFile(result.filePath);
    }
    return result.filePath;
  } catch (error) {
    console.error('Error al guardar el archivo:', error);
    throw AppError.internal(
      `Error al guardar el archivo: ${error.message}`,
      "FILE_SAVE_ERROR",
      error
    );
  }
}

function registerReportHandlers() {
  const eventManager = EventManager.getInstance();

  const handlers = {
    [IPC_CHANNELS.REPORT.EXPORT_PDF]: async (event, { data, template }) => {
      if (!data) {
        throw AppError.validation("Datos requeridos para generar PDF", "DATA_REQUIRED");
      }

      try {
        // Crear la definición del documento
        const docDefinition = template ? JSON.parse(template) : {
          content: [
            { text: data.title || "Reporte", style: 'header' },
            { text: data.subtitle || "Generado el " + new Date().toLocaleDateString(), style: 'subheader' },
            { text: data.content || "Sin contenido", margin: [0, 10, 0, 0] }
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10]
            },
            subheader: {
              fontSize: 14,
              bold: true,
              margin: [0, 10, 0, 5]
            }
          }
        };

        // Generar y guardar el PDF
        const pdfDoc = pdfMake.createPdf(docDefinition);
        const filePath = await saveFile(pdfDoc, "pdf");
        
        eventManager.emit("report.generated", { type: "pdf", filePath });
        return filePath;
      } catch (error) {
        throw AppError.internal("Error al generar PDF", "PDF_GENERATION_ERROR", error);
      }
    },

    [IPC_CHANNELS.REPORT.EXPORT_EXCEL]: async (event, { data, template }) => {
      if (!data) {
        throw AppError.validation("Datos requeridos para generar Excel", "DATA_REQUIRED");
      }

      try {
        // Crear una nueva instancia de Workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(template?.sheetName || 'Reporte');

        // Convertir datos a formato de hoja de cálculo
        if (data.length > 0) {
          // Obtener encabezados de las claves del primer objeto
          const headers = Object.keys(data[0]);
          
          // Agregar encabezados
          worksheet.addRow(headers);
          
          // Agregar datos
          data.forEach(item => {
            const row = headers.map(header => item[header]);
            worksheet.addRow(row);
          });

          // Aplicar formato a los encabezados
          const headerRow = worksheet.getRow(1);
          headerRow.font = { bold: true };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
          };
        }
        
        // Autoajustar columnas
        worksheet.columns.forEach(column => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, cell => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });
        
        // Guardar el archivo
        const filePath = await saveFile(workbook, "xlsx");
        eventManager.emit("report.generated", { type: "excel", filePath });
        return filePath;
      } catch (error) {
        console.error('Error al generar Excel:', error);
        throw AppError.internal("Error al generar Excel", "EXCEL_GENERATION_ERROR", error);
      }
    },

    [IPC_CHANNELS.REPORT.TEMPLATES.GET]: async () => {
      try {
        const files = fs.readdirSync(REPORT_TEMPLATES_DIR);
        return files.map(file => ({
          id: path.basename(file, path.extname(file)),
          name: path.basename(file, path.extname(file)),
          content: fs.readFileSync(path.join(REPORT_TEMPLATES_DIR, file), "utf-8")
        }));
      } catch (error) {
        throw AppError.internal("Error al obtener plantillas", "TEMPLATES_FETCH_ERROR", error);
      }
    },

    [IPC_CHANNELS.REPORT.TEMPLATES.SAVE]: async (event, { name, content }) => {
      if (!name || !content) {
        throw AppError.validation("Nombre y contenido requeridos", "TEMPLATE_REQUIRED");
      }

      try {
        const filePath = path.join(REPORT_TEMPLATES_DIR, `${name}.json`);
        fs.writeFileSync(filePath, content);
        eventManager.emit("template.saved", { name });
      } catch (error) {
        throw AppError.internal("Error al guardar plantilla", "TEMPLATE_SAVE_ERROR", error);
      }
    },

    [IPC_CHANNELS.REPORT.TEMPLATES.DELETE]: async (event, name) => {
      if (!name) {
        throw AppError.validation("Nombre requerido", "TEMPLATE_NAME_REQUIRED");
      }

      try {
        const filePath = path.join(REPORT_TEMPLATES_DIR, `${name}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          eventManager.emit("template.deleted", { name });
        }
      } catch (error) {
        throw AppError.internal("Error al eliminar plantilla", "TEMPLATE_DELETE_ERROR", error);
      }
    },

    [IPC_CHANNELS.REPORT.TEMPLATES.GET]: async () => {
      try {
        const files = fs.readdirSync(REPORT_TEMPLATES_DIR);
        return files.map(file => ({
          id: path.basename(file, path.extname(file)),
          name: path.basename(file, path.extname(file)),
          content: fs.readFileSync(path.join(REPORT_TEMPLATES_DIR, file), "utf-8")
        }));
      } catch (error) {
        throw AppError.internal("Error al obtener plantillas", "TEMPLATES_FETCH_ERROR", error);
      }
    },

    [IPC_CHANNELS.REPORT.TEMPLATES.SAVE]: async (event, { name, content }) => {
      if (!name || !content) {
        throw AppError.validation("Nombre y contenido requeridos", "TEMPLATE_REQUIRED");
      }

      try {
        const filePath = path.join(REPORT_TEMPLATES_DIR, `${name}.json`);
        fs.writeFileSync(filePath, content);
        eventManager.emit("template.saved", { name });
      } catch (error) {
        throw AppError.internal("Error al guardar plantilla", "TEMPLATE_SAVE_ERROR", error);
      }
    },

    [IPC_CHANNELS.REPORT.TEMPLATES.DELETE]: async (event, name) => {
      if (!name) {
        throw AppError.validation("Nombre requerido", "TEMPLATE_NAME_REQUIRED");
      }

      try {
        const filePath = path.join(REPORT_TEMPLATES_DIR, `${name}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          eventManager.emit("template.deleted", { name });
        }
      } catch (error) {
        throw AppError.internal("Error al eliminar plantilla", "TEMPLATE_DELETE_ERROR", error);
      }
    }
  };

  return handlers;
}

module.exports = { registerReportHandlers };
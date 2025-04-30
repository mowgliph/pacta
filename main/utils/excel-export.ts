import { dialog } from "electron";
import * as XLSX from "xlsx";
import { app } from "electron";
import path from "path";
import fs from "fs";

export async function exportToExcel(
  data: any,
  fileName: string,
  format: "excel" | "csv"
): Promise<string> {
  try {
    // Crear el directorio de exportaciones si no existe
    const exportDir = path.join(app.getPath("documents"), "PactaExports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Convertir los datos a formato de hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");

    // Definir la extensión del archivo según el formato
    const fileExtension = format === "excel" ? ".xlsx" : ".csv";
    const fullFileName = `${fileName}${fileExtension}`;
    const filePath = path.join(exportDir, fullFileName);

    // Escribir el archivo
    if (format === "excel") {
      XLSX.writeFile(wb, filePath);
    } else {
      const csv = XLSX.utils.sheet_to_csv(ws);
      fs.writeFileSync(filePath, csv, "utf8");
    }

    return filePath;
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    throw new Error("No se pudo exportar el archivo");
  }
}

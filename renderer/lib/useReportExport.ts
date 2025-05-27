import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ReportsApi } from "@/types/electron";

export function useReportExport() {
  const { toast } = useToast();

  const exportToPDF = useCallback(async (data: any[], template?: string) => {
    try {
      const response = await (window.electron.reports as ReportsApi).exportPDF(data, template);
    if (!response.success) {
      throw new Error(response.error?.message || 'Error al exportar PDF');
    }
    const filePath = response.data.filePath;
      toast({
        title: "Exportación exitosa",
        description: `El reporte se ha exportado a ${filePath}`,
      });
      return filePath;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte a PDF",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const exportToExcel = useCallback(async (reportType: string, data: any[], template?: string) => {
    try {
      const response = await (window.electron.reports as ReportsApi).exportExcel(data, template);
    if (!response.success) {
      throw new Error(response.error?.message || 'Error al exportar Excel');
    }
    const filePath = response.data.filePath;
      toast({
        title: "Exportación exitosa",
        description: `El reporte se ha exportado a ${filePath}`,
      });
      return filePath;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte a Excel",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  return {
    exportToPDF,
    exportToExcel,
  };
}

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, FileSpreadsheet, Download } from "lucide-react";
import { useReportExport } from "@/lib/useReportExport";

interface ReportExportProps {
  reportType: string;
  data: any[];
  template?: string;
}

export function ReportExport({ reportType, data, template }: ReportExportProps) {
  const { exportToPDF, exportToExcel } = useReportExport();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportToPDF(reportType, data, template)}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Exportar a PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel(reportType, data, template)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Exportar a Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

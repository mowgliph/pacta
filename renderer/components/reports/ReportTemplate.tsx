import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useReportTemplates } from "@/lib/useReportTemplates";
import { useState } from "react";

interface ReportTemplateProps {
  onTemplateSelect?: (template: string) => void;
}

export function ReportTemplate({ onTemplateSelect }: ReportTemplateProps) {
  const { toast } = useToast();
  const { templates, saveTemplate, deleteTemplate } = useReportTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleSaveTemplate = () => {
    const name = (document.getElementById("templateName") as HTMLInputElement).value;
    const content = (document.getElementById("templateContent") as HTMLTextAreaElement).value;

    if (!name || !content) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    saveTemplate(name, content).then(() => {
      toast({
        title: "Plantilla guardada",
        description: "La plantilla se ha guardado exitosamente",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive",
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plantillas de Reporte</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Nombre de la plantilla</Label>
            <Input id="templateName" placeholder="Nombre de la plantilla" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="templateContent">Contenido de la plantilla</Label>
            <Textarea id="templateContent" rows={10} placeholder="Contenido de la plantilla..." />
          </div>
          <Button onClick={handleSaveTemplate}>
            Guardar Plantilla
          </Button>
          
          <div className="mt-4">
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar plantilla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {"Seleccionar plantilla"}
                </SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="mt-4 space-y-4">
              <div className="font-medium">Plantilla seleccionada:</div>
              <div className="p-4 bg-card rounded-lg">
                {templates.find(t => t.id === selectedTemplate)?.content}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

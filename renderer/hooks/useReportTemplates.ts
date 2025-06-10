import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ipcRenderer } from "electron";

interface Template {
  id: string;
  name: string;
  content: string;
}

export function useReportTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await ipcRenderer.invoke("report:templates:get");
      setTemplates(loadedTemplates);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    }
  };

  const saveTemplate = async (name: string, content: string) => {
    try {
      await ipcRenderer.invoke("report:template:save", { name, content });
      await loadTemplates();
      toast({
        title: "Plantilla guardada",
        description: "La plantilla se ha guardado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await ipcRenderer.invoke("report:template:delete", id);
      await loadTemplates();
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se ha eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive",
      });
    }
  };

  return {
    templates,
    saveTemplate,
    deleteTemplate,
  };
}

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractSchema, legalRepresentativeSchema, type LegalRepresentativeValues } from "@/schemas/contract.schema";
import type { ContractFormValues } from "@/schemas/contract.schema";
import { useAuth } from "@/store/auth";
import { useNotification } from "@/hooks/useNotification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { LegalRepresentativeForm } from "@/components/forms/LegalRepresentativeForm";
import { Textarea } from "@/components/ui/textarea";
import { IconUpload, IconX } from "@tabler/icons-react";

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewContractModal({
  isOpen,
  onClose,
  onSuccess,
}: NewContractModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedContractFile, setSelectedContractFile] = useState<File | null>(
    null
  );

  const defaultValues: ContractFormValues = {
    type: "Cliente",
    status: "ACTIVO",
    isArchived: false,
    ownerId: user?.id || "",
    createdById: user?.id || "",
    contractNumber: "",
    companyName: "",
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    description: "",
    legalRepresentative: {
      name: "",
      position: "",
      documentType: "",
      documentNumber: "",
      documentDate: undefined,
      email: "",
      phone: "",
      companyName: "",
      companyAddress: "",
      companyPhone: "",
      companyEmail: ""
    },
    legalRepresentativeId: null,
    documentType: "",
    documentDescription: "",
  };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const handleContractFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedContractFile(file);
      setValue("document", file);
    }
  };

  const simulateProgress = async () => {
    setUploadProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUploadProgress(i);
    }
  };

  const onSubmit = async (formData: ContractFormValues) => {
    try {
      setIsSubmitting(true);

      if (!window.electron?.ipcRenderer) {
        throw new Error("API de contratos no disponible");
      }

      // Validar fechas
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }

      let representativeDocumentUrl = "";

      // 1. Primero, crear el representante legal si se proporcionó la información
      let legalRepresentativeId = formData.legalRepresentativeId;
      
      if (formData.legalRepresentative?.name && formData.legalRepresentative?.position) {
        const legalRepData = {
          ...formData.legalRepresentative,
          createdById: user?.id,
        };

        // Validar que tenemos los datos necesarios
        if (!legalRepData.name || !legalRepData.position || !legalRepData.companyName) {
          throw new Error("Datos del representante legal incompletos");
        }

        const legalRepResult = await window.electron.ipcRenderer.invoke("legal-representatives:create", legalRepData);

        if (!legalRepResult?.success || !legalRepResult.data?.id) {
          throw new Error(
            legalRepResult.error?.message || "Error al crear el representante legal"
          );
        }
        
        legalRepresentativeId = legalRepResult.data.id;
      }

      // 2. Subir el documento del contrato si existe
      let contractDocumentUrl = "";
      if (selectedContractFile) {
        const uploadResult = await window.electron.ipcRenderer.invoke("documents:upload", {
          name: selectedContractFile.name,
          type: selectedContractFile.type,
          description: formData.documentDescription || "Documento principal del contrato",
        });

        if (!uploadResult?.success) {
          throw new Error(
            uploadResult.error?.message || "Error al subir el documento del contrato"
          );
        }
        contractDocumentUrl = uploadResult.data;
      }

      // 3. Crear el contrato con toda la información
      const contractData = {
        ...formData,
        legalRepresentativeId,
        document: selectedContractFile,
        documentUrl: contractDocumentUrl,
        ownerId: user?.id,
        createdById: user?.id,
        // Eliminar el objeto legalRepresentative ya que ya lo procesamos
        legalRepresentative: undefined,
      };

      const result = await window.electron.ipcRenderer.invoke("contracts:create", contractData);

      if (result?.success) {
        toast({
          title: "Contrato creado exitosamente",
          description: "El contrato y sus documentos han sido guardados correctamente",
          variant: "success"
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
        reset();
        setSelectedContractFile(null);
        onClose();
        onSuccess?.();
      } else {
        toast({
          title: "Error al crear el contrato",
          description: result.error?.message || "No se pudo crear el contrato. Por favor, intenta nuevamente.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
        toast({
          title: "Error al crear el contrato",
          description:
            error instanceof Error ? error.message : "Ha ocurrido un error al procesar la solicitud",
          variant: "destructive"
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ToastProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Nuevo Contrato
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete los campos para crear un nuevo contrato.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractNumber">Número de contrato</Label>
              <Input
                id="contractNumber"
                placeholder="Ej: CTR-2024-001"
                {...register('contractNumber')}
                className="mt-2"
              />
              {errors.contractNumber && (
                <p className="text-sm text-destructive mt-1">
                  {errors.contractNumber.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="companyName">Nombre de la empresa</Label>
              <Input
                id="companyName"
                placeholder="Nombre de la empresa"
                {...register('companyName')}
                className="mt-2"
              />
              {errors.companyName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.companyName.message}
                </p>
              )}
            </div>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo de Contrato</Label>
                <RadioGroup
                  id="type"
                  value={watch("type")}
                  onValueChange={(value: "Cliente" | "Proveedor") => form.setValue("type", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Cliente"
                      id="type-cliente"
                      className="data-[state=checked]:bg-primary"
                    />
                    <Label
                      htmlFor="type-cliente"
                      className="text-sm font-medium"
                    >
                      Cliente
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Proveedor"
                      id="type-proveedor"
                      className="data-[state=checked]:bg-primary"
                    />
                    <Label
                      htmlFor="type-proveedor"
                      className="text-sm font-medium"
                    >
                      Proveedor
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={watch("status") === "ACTIVO"}
                    onCheckedChange={(checked: boolean) => {
                      const status = checked ? "ACTIVO" : "VENCIDO";
                      form.setValue("status", status);
                    }}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground"
                  />
                  <span className="text-sm font-medium">
                    {watch("status") === "ACTIVO" ? "Activo" : "Vencido"}
                  </span>
                </div>
                </div>
              </div>

              <div>
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate', {
                    valueAsDate: true,
                  })}
                  className="mt-2"
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate">Fecha de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate', {
                    valueAsDate: true,
                  })}
                  className="mt-2"
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Descripción y Documentos</h3>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del contrato..."
                {...register('description')}
                className="mt-2"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="documentType">Tipo de documento</Label>
                <Input
                  id="documentType"
                  placeholder="Tipo de documento"
                  {...register('documentType')}
                  className="mt-2"
                />
                {errors.documentType && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.documentType.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="documentDescription">Descripción del documento</Label>
                <Input
                  id="documentDescription"
                  placeholder="Descripción del documento"
                  {...register('documentDescription')}
                  className="mt-2"
                />
                {errors.documentDescription && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.documentDescription.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="document">Documento del contrato</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="file"
                    id="contractFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleContractFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => document.getElementById('contractFile')?.click()}
                  >
                    <IconUpload className="w-4 h-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                  {selectedContractFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedContractFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedContractFile(null);
                          setValue('document', undefined);
                        }}
                      >
                        <IconX className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>


            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Representante Legal</h3>
            <FormProvider {...form}>
              <LegalRepresentativeForm className="space-y-4" />
            </FormProvider>
          </Card>

          <DialogFooter className="border-t p-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Creando..." : "Crear contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
      <ToastViewport />
    </ToastProvider>
  );
};

export default NewContractModal;

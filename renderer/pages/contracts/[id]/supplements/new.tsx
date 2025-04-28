// renderer/pages/contracts/[id]/supplements/new.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "../../../../components/layout/Layout";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";
import { Heading } from "../../../../components/ui/heading";
import { useToast } from "../../../../hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { CalendarIcon, File, Loader2Icon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { cn } from "../../../../lib/utils";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";

// Definir esquema de validación para suplementos
const supplementSchema = z.object({
  // Campo modificado
  fieldType: z.enum(["title", "description", "amount", "endDate", "status"], {
    required_error: "Debe seleccionar el campo a modificar",
  }),

  // Valores posibles dependiendo del tipo de campo
  newTitle: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .optional(),
  newDescription: z.string().optional(),
  newAmount: z.coerce
    .number()
    .min(0, "El monto debe ser mayor o igual a 0")
    .optional(),
  newEndDate: z.date().optional(),
  newStatus: z.enum(["Vigente", "Suspendido", "Terminado"]).optional(),

  // Campos comunes
  reason: z.string().min(5, "Debe proporcionar un motivo para el suplemento"),
  notes: z.string().optional(),
});

type SupplementFormValues = z.infer<typeof supplementSchema>;

export default function NewSupplement() {
  const auth = useRequireAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contract, setContract] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Inicializar formulario con valores predeterminados
  const form = useForm<SupplementFormValues>({
    resolver: zodResolver(supplementSchema),
    defaultValues: {
      fieldType: undefined,
      reason: "",
      notes: "",
    },
  });

  // Obtener el tipo de campo seleccionado
  const watchFieldType = form.watch("fieldType");

  // Cargar datos del contrato
  useEffect(() => {
    async function loadContract() {
      if (id && typeof id === "string") {
        try {
          setIsLoading(true);
          const contractData = await window.Electron.contratos.obtener(id);
          setContract(contractData);

          // Precargar valores actuales como referencia
          if (contractData) {
            form.setValue("newTitle", contractData.title || "");
            form.setValue("newDescription", contractData.description || "");
            form.setValue("newAmount", contractData.amount || 0);
            form.setValue(
              "newEndDate",
              new Date(contractData.endDate) || new Date()
            );
            form.setValue("newStatus", contractData.status || "Vigente");
          }
        } catch (error) {
          console.error("Error al cargar contrato:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar la información del contrato",
            variant: "destructive",
          });
          router.push("/contracts");
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadContract();
  }, [id, router, toast, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Función para mostrar el valor actual del campo seleccionado
  const getCurrentValueLabel = () => {
    if (!contract) return "Cargando...";

    switch (watchFieldType) {
      case "title":
        return contract.title || "Sin título";
      case "description":
        return contract.description || "Sin descripción";
      case "amount":
        return `${contract.amount || 0}`;
      case "endDate":
        return contract.endDate
          ? format(new Date(contract.endDate), "PPP", { locale: es })
          : "Sin fecha";
      case "status":
        return contract.status || "Vigente";
      default:
        return "Seleccione un campo para modificar";
    }
  };

  // Función para obtener el estado de validez del formulario según el campo seleccionado
  const isFieldValid = () => {
    if (!watchFieldType) return false;

    switch (watchFieldType) {
      case "title":
        return !!form.getValues("newTitle");
      case "description":
        return true; // La descripción puede ser vacía
      case "amount":
        return form.getValues("newAmount") != null;
      case "endDate":
        return !!form.getValues("newEndDate");
      case "status":
        return !!form.getValues("newStatus");
      default:
        return false;
    }
  };

  const onSubmit = async (data: SupplementFormValues) => {
    if (!id || typeof id !== "string" || !contract) return;

    // Verificar que se haya seleccionado un campo y tenga un valor válido
    if (!watchFieldType || !isFieldValid()) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar un campo y proporcionar un valor válido",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Preparar los datos del suplemento
      const supplementData = {
        contractId: id,
        fieldName: watchFieldType,
        previousValue: contract[watchFieldType],
        newValue:
          data[
            `new${
              watchFieldType.charAt(0).toUpperCase() + watchFieldType.slice(1)
            }`
          ],
        reason: data.reason,
        notes: data.notes,
        createdById: auth.user?.id,
      };

      // Crear suplemento
      const response = await window.Electron.suplementos.crear(
        id,
        supplementData
      );

      // Si se seleccionó un archivo, subirlo
      if (selectedFile && response.supplement.id) {
        // Convertir el archivo a un ArrayBuffer para enviarlo por IPC
        const arrayBuffer = await selectedFile.arrayBuffer();

        await window.Electron.documentos.guardar(
          id, // ID del contrato
          {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            data: Array.from(new Uint8Array(arrayBuffer)),
            supplementId: response.supplement.id, // Vincular al suplemento
          }
        );
      }

      toast({
        title: "Suplemento creado",
        description: "El suplemento ha sido creado exitosamente",
      });

      // Redireccionar a la página de detalles del contrato
      router.push(`/contracts/${id}`);
    } catch (error) {
      console.error("Error al crear suplemento:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el suplemento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!auth.user) return null;

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Heading
          title="Crear Suplemento"
          description={
            isLoading
              ? "Cargando información..."
              : `Contrato: ${contract?.title || contract?.contractNumber || ""}`
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !contract ? (
          <div className="text-center py-8">
            <p>No se encontró el contrato solicitado.</p>
            <Button className="mt-4" onClick={() => router.push("/contracts")}>
              Volver a Contratos
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 space-y-6"
            >
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium">
                    Información del Contrato
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Número de Contrato</Label>
                        <div className="mt-1 p-2 border rounded-md bg-muted">
                          {contract.contractNumber}
                        </div>
                      </div>
                      <div>
                        <Label>Empresa</Label>
                        <div className="mt-1 p-2 border rounded-md bg-muted">
                          {contract.companyName}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              contract.type === "Cliente"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {contract.type}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label>Estado Actual</Label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              contract.status === "Vigente"
                                ? "default"
                                : contract.status === "Próximo a Vencer"
                                ? "warning"
                                : contract.status === "Vencido"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {contract.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium">Campo a modificar</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fieldType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Seleccione el campo que desea modificar *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar campo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="title">Título</SelectItem>
                              <SelectItem value="description">
                                Descripción
                              </SelectItem>
                              <SelectItem value="amount">Monto</SelectItem>
                              <SelectItem value="endDate">
                                Fecha de Fin
                              </SelectItem>
                              <SelectItem value="status">Estado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchFieldType && (
                      <div className="p-3 border rounded-md bg-muted">
                        <div className="text-sm font-medium mb-1">
                          Valor actual:
                        </div>
                        <div>{getCurrentValueLabel()}</div>
                      </div>
                    )}

                    {watchFieldType === "title" && (
                      <FormField
                        control={form.control}
                        name="newTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nuevo Título *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingrese el nuevo título"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watchFieldType === "description" && (
                      <FormField
                        control={form.control}
                        name="newDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nueva Descripción</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ingrese la nueva descripción"
                                className="resize-none min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watchFieldType === "amount" && (
                      <FormField
                        control={form.control}
                        name="newAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nuevo Monto *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.valueAsNumber || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watchFieldType === "endDate" && (
                      <FormField
                        control={form.control}
                        name="newEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Nueva Fecha de Fin *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watchFieldType === "status" && (
                      <FormField
                        control={form.control}
                        name="newStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nuevo Estado *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Vigente">Vigente</SelectItem>
                                <SelectItem value="Suspendido">
                                  Suspendido
                                </SelectItem>
                                <SelectItem value="Terminado">
                                  Terminado
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium">Justificación</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo del Suplemento *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Indique el motivo por el cual se realiza este suplemento"
                              className="resize-none min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Adicionales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Información adicional (opcional)"
                              className="resize-none min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="document">
                        Documento del Suplemento (opcional)
                      </Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="document"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          className="max-w-sm"
                        />
                        {selectedFile && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <File className="h-4 w-4" />
                            {selectedFile.name}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Formatos aceptados: PDF, DOC, DOCX. Tamaño máximo: 10MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/contracts/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Guardando..." : "Guardar Suplemento"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </div>
    </Layout>
  );
}

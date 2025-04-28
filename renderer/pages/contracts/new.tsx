// renderer/pages/contracts/new.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "../../components/layout/Layout";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { Heading } from "../../components/ui/heading";
import { useToast } from "../../hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { CalendarIcon, File, Loader2Icon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";
import { Label } from "../../components/ui/label";

// Definir esquema de validación
const contractSchema = z.object({
  contractNumber: z.string().min(1, "El número de contrato es obligatorio"),
  companyName: z.string().min(1, "El nombre de la empresa es obligatorio"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(["Cliente", "Proveedor"]),
  signDate: z.date({
    required_error: "La fecha de firma es obligatoria",
  }),
  startDate: z.date({
    required_error: "La fecha de inicio es obligatoria",
  }),
  endDate: z
    .date({
      required_error: "La fecha de fin es obligatoria",
    })
    .refine((data) => data > new Date(), {
      message: "La fecha de fin debe ser futura",
    }),
  amount: z.coerce.number().min(0, "El monto debe ser mayor o igual a 0"),
  parties: z
    .array(
      z.object({
        name: z.string().min(1, "El nombre es obligatorio"),
        role: z.string().optional(),
        contact: z.string().optional(),
      })
    )
    .optional(),
  metadata: z.record(z.any()).optional(),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function NewContract() {
  const auth = useRequireAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parties, setParties] = useState([{ name: "", role: "", contact: "" }]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Inicializar formulario con valores predeterminados
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractNumber: "",
      companyName: "",
      title: "",
      description: "",
      type: "Cliente",
      signDate: new Date(),
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      amount: 0,
      parties: parties,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addParty = () => {
    setParties([...parties, { name: "", role: "", contact: "" }]);
    const currentParties = form.getValues().parties || [];
    form.setValue("parties", [
      ...currentParties,
      { name: "", role: "", contact: "" },
    ]);
  };

  const updateParty = (index: number, field: string, value: string) => {
    const updatedParties = [...parties];
    updatedParties[index] = { ...updatedParties[index], [field]: value };
    setParties(updatedParties);

    const formParties = [...(form.getValues().parties || [])];
    formParties[index] = { ...formParties[index], [field]: value };
    form.setValue("parties", formParties);
  };

  const onSubmit = async (data: ContractFormValues) => {
    try {
      setIsSubmitting(true);

      // Preparar datos para enviar al proceso principal
      const contractData = {
        ...data,
        createdById: auth.user?.id,
        ownerId: auth.user?.id,
        metadata: {
          documentUploaded: selectedFile ? true : false,
        },
      };

      // Crear contrato
      const response = await window.Electron.contratos.crear(contractData);

      // Si se seleccionó un archivo, subirlo
      if (selectedFile && response.contract.id) {
        // Convertir el archivo a un ArrayBuffer para enviarlo por IPC
        const arrayBuffer = await selectedFile.arrayBuffer();

        await window.Electron.documentos.guardar(response.contract.id, {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          data: Array.from(new Uint8Array(arrayBuffer)),
        });
      }

      toast({
        title: "Contrato creado",
        description: "El contrato ha sido creado exitosamente",
      });

      // Redireccionar a la página de detalles del contrato
      router.push(`/contracts/${response.contract.id}`);
    } catch (error) {
      console.error("Error al crear contrato:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el contrato",
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
          title="Crear Nuevo Contrato"
          description="Ingresa la información del nuevo contrato"
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-6"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Información General</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Contrato *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: CONT-2025-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre de la empresa"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input placeholder="Título del contrato" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cliente">Cliente</SelectItem>
                            <SelectItem value="Proveedor">Proveedor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada del contrato"
                          {...field}
                          className="resize-none min-h-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Fechas y Montos</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="signDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Firma *</FormLabel>
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Inicio *</FormLabel>
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
                          <PopoverContent className="w-auto p-0" align="start">
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

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Fin *</FormLabel>
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date <= new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto *</FormLabel>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Partes del Contrato</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parties.map((party, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md"
                    >
                      <div>
                        <Label htmlFor={`party-name-${index}`}>Nombre *</Label>
                        <Input
                          id={`party-name-${index}`}
                          value={party.name}
                          onChange={(e) =>
                            updateParty(index, "name", e.target.value)
                          }
                          placeholder="Nombre de la parte"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`party-role-${index}`}>Rol</Label>
                        <Input
                          id={`party-role-${index}`}
                          value={party.role}
                          onChange={(e) =>
                            updateParty(index, "role", e.target.value)
                          }
                          placeholder="Ej: Cliente, Proveedor, Representante"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`party-contact-${index}`}>
                          Contacto
                        </Label>
                        <Input
                          id={`party-contact-${index}`}
                          value={party.contact}
                          onChange={(e) =>
                            updateParty(index, "contact", e.target.value)
                          }
                          placeholder="Información de contacto"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addParty}
                    className="mt-2"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Agregar Parte
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Documento del Contrato</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="document">Adjuntar Documento</Label>
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
                onClick={() => router.push("/contracts")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Guardando..." : "Guardar Contrato"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </div>
    </Layout>
  );
}

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractSchema } from "@/schemas/contract.schema";
import type { ContractFormValues } from "@/schemas/contract.schema";
import { useAuth } from "@/store/auth";
import { useNotification } from "@/lib/useNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewContractModal({ isOpen, onClose, onSuccess }: NewContractModalProps) {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    legalRepresentativeId: null,
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
    control
  } = form;

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const onSubmit = async (data: ContractFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!window.electron?.ipcRenderer) {
        throw new Error("API de contratos no disponible");
      }

      const result = await window.electron.ipcRenderer.invoke("contracts:create", data);

      if (result.success) {
        notify({
          title: "Contrato creado",
          body: "El contrato se ha creado correctamente",
          variant: "success",
        });
        reset();
        onClose();
        onSuccess?.();
      } else {
        throw new Error(result.error || "Error al crear el contrato");
      }
    } catch (error: any) {
      notify({
        title: "Error",
        body: error.message || "Error al crear el contrato",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#001B48] font-inter">
            Nuevo Contrato
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractNumber">Número de Contrato *</Label>
              <Input
                id="contractNumber"
                placeholder="Ej: CONT-2023-001"
                {...register("contractNumber")}
                className={errors.contractNumber ? "border-red-500" : ""}
              />
              {errors.contractNumber && (
                <p className="text-sm text-red-500">{errors.contractNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                onValueChange={(value: "Cliente" | "Proveedor") =>
                  setValue("type", value)
                }
                defaultValue="Cliente"
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Proveedor">Proveedor</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Empresa *</Label>
              <Input
                id="companyName"
                placeholder="Nombre de la empresa"
                {...register("companyName")}
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha de Inicio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                      errors.startDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(new Date(startDate), "PPP") : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="rounded-md border p-3">
                    <Calendar
                      selectedDate={startDate instanceof Date ? startDate : new Date(startDate)}
                      onSelectDate={(date: Date) => setValue("startDate", date)}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                      errors.endDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(new Date(endDate), "PPP") : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="rounded-md border p-3">
                    <Calendar
                      selectedDate={endDate instanceof Date ? endDate : new Date(endDate)}
                      onSelectDate={(date: Date) => setValue("endDate", date)}
                      events={[]}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                {...register("description")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descripción del contrato (opcional)"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

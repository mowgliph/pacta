"use client";

import { useState } from "react";
import { useForm, ControllerRenderProps, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSupplements } from "@/hooks/useSupplements";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupplementType, SupplementChangeType } from "@/types/supplement.types";
import { ScrollArea } from "@/components/ui/scroll-area";

const createSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  type: z.nativeEnum(SupplementType),
  changeType: z.nativeEnum(SupplementChangeType),
  effectiveDate: z.string().min(1, "La fecha efectiva es requerida"),
  previousValue: z.string().min(1, "El valor anterior es requerido"),
  newValue: z.string().min(1, "El nuevo valor es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
});

type CreateFormValues = z.infer<typeof createSchema>;

interface CreateSupplementDialogProps {
  contractId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSupplementDialog({
  contractId,
  isOpen,
  onClose,
  onSuccess,
}: CreateSupplementDialogProps) {
  const { createSupplement, isLoading } = useSupplements();
  const { toast } = useToast();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: "",
      type: SupplementType.AMOUNT,
      changeType: SupplementChangeType.MODIFICATION,
      effectiveDate: "",
      previousValue: "",
      newValue: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateFormValues) => {
    try {
      const result = await createSupplement({
        contractId,
        ...data,
      });
      if (result) {
        toast({
          title: "Éxito",
          description: "Suplemento creado correctamente",
        });
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el suplemento",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Suplemento</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-1"
            >
              <FormField
                control={form.control}
                name="type"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FieldValues, "type">;
                }) => (
                  <FormItem>
                    <FormLabel>Tipo de Suplemento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SupplementType.AMOUNT}>
                          Monto
                        </SelectItem>
                        <SelectItem value={SupplementType.DATE}>
                          Fecha
                        </SelectItem>
                        <SelectItem value={SupplementType.DESCRIPTION}>
                          Descripción
                        </SelectItem>
                        <SelectItem value={SupplementType.OTHER}>
                          Otro
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="previousValue"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FieldValues, "previousValue">;
                }) => (
                  <FormItem>
                    <FormLabel>Valor Anterior</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ingrese el valor anterior"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newValue"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FieldValues, "newValue">;
                }) => (
                  <FormItem>
                    <FormLabel>Nuevo Valor</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el nuevo valor" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FieldValues, "description">;
                }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ingrese una descripción del suplemento"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creando..." : "Crear Suplemento"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

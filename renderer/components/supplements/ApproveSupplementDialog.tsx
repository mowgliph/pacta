import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { ControllerRenderProps } from "react-hook-form";

const approveSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
});

type ApproveFormValues = z.infer<typeof approveSchema>;

interface ApproveSupplementDialogProps {
  supplementId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveSupplementDialog({
  supplementId,
  isOpen,
  onClose,
  onSuccess,
}: ApproveSupplementDialogProps) {
  const { approveSupplement, isLoading } = useSupplements();
  const { toast } = useToast();

  const form = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      description: "",
    },
  });

  const onSubmit = async (data: ApproveFormValues) => {
    try {
      const result = await approveSupplement(supplementId);
      if (result) {
        toast({
          title: "Éxito",
          description: "Suplemento aprobado correctamente",
        });
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar el suplemento",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprobar Suplemento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({
                field,
              }: {
                field: ControllerRenderProps<ApproveFormValues, "description">;
              }) => (
                <FormItem>
                  <FormLabel>Descripción de la Aprobación</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ingrese una descripción de la aprobación"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Aprobando..." : "Aprobar Suplemento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

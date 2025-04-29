import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSupplements } from "../../hooks/useSupplements";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";

const approveSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
});

type ApproveFormValues = z.infer<typeof approveSchema>;

interface ApproveSupplementDialogProps {
  supplementId: string;
  trigger?: React.ReactNode;
}

export function ApproveSupplementDialog({
  supplementId,
  trigger,
}: ApproveSupplementDialogProps) {
  const [open, setOpen] = useState(false);
  const { approveSupplement } = useSupplements();
  const { toast } = useToast();

  const form = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
  });

  const onSubmit = async (data: ApproveFormValues) => {
    try {
      await approveSupplement(supplementId, data.description);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error approving supplement:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Aprobar</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Aprobar Suplemento
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

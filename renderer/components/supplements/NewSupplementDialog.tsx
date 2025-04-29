import { useState } from "react";
import {
  useForm,
  type FieldValues,
  ControllerRenderProps,
  Resolver,
  SubmitHandler,
} from "react-hook-form";
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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Supplement } from "../../types";

const supplementSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  changes: z.string().min(1, "Los cambios son requeridos"),
  effectiveDate: z.date({
    required_error: "La fecha de efectividad es requerida",
  }),
  contractId: z.string().min(1, "El contrato es requerido"),
  amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
  isApproved: z.boolean().default(false),
  createdById: z.string().min(1, "El ID del creador es requerido"),
});

type SupplementFormValues = z.infer<typeof supplementSchema>;

interface NewSupplementDialogProps {
  contractId: string;
  trigger?: React.ReactNode;
  createdById: string;
}

export function NewSupplementDialog({
  contractId,
  trigger,
  createdById,
}: NewSupplementDialogProps) {
  const [open, setOpen] = useState(false);
  const { createSupplement } = useSupplements();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(supplementSchema),
    defaultValues: {
      title: "",
      description: "",
      changes: "",
      effectiveDate: new Date(),
      contractId: "",
      amount: 0,
      isApproved: false,
      createdById: "",
    },
  });

  const onSubmit = async (data: SupplementFormValues) => {
    try {
      const supplementData: Omit<
        Supplement,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "createdBy"
        | "approvedBy"
        | "documents"
      > = {
        ...data,
        createdById,
        description: data.description || "",
        isApproved: false,
      };
      await createSupplement(supplementData);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating supplement:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Nuevo Suplemento</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Suplemento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SupplementFormValues, "title">;
              }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                field: ControllerRenderProps<
                  SupplementFormValues,
                  "description"
                >;
              }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="changes"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SupplementFormValues, "changes">;
              }) => (
                <FormItem>
                  <FormLabel>Cambios</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SupplementFormValues, "amount">;
              }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="effectiveDate"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  SupplementFormValues,
                  "effectiveDate"
                >;
              }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Efectividad</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
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
                        value={
                          field.value ? format(field.value, "yyyy-MM-dd") : ""
                        }
                        onChange={(value) => field.onChange(new Date(value))}
                        min={format(new Date(), "yyyy-MM-dd")}
                        className="border-0"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Crear Suplemento
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

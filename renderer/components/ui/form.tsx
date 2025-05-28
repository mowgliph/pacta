import * as React from "react";
import { Controller } from "react-hook-form";
import { cn } from "../../lib/utils";

export function Form({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form {...props} className={cn("space-y-6", props.className)}>
      {children}
    </form>
  );
}

export function FormField({ name, control, render }: any) {
  return (
    <Controller name={name} control={control} render={render} />
  );
}

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
);
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("block text-sm font-medium", className)} {...props} />
  )
);
FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
FormControl.displayName = "FormControl";

export const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-red-500", className)} {...props} />
  )
);
FormMessage.displayName = "FormMessage";

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props} />
  )
);
FormDescription.displayName = "FormDescription"; 
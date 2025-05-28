import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "../../lib/utils";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

// Interfaz para las props del Select
interface SelectProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  label?: string;
  description?: string;
  error?: string;
  success?: boolean;
  containerClassName?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

// Componente Select principal
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      children,
      label,
      description,
      error,
      success,
      containerClassName,
      placeholder = "Seleccionar...",
      required,
      icon,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const hasError = !!error;
    const showSuccess = success && !hasError;

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground/90"
          >
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        )}
        <SelectPrimitive.Root {...props}>
          <SelectTrigger
            id={id}
            hasError={hasError}
            showSuccess={showSuccess}
            icon={icon}
            aria-describedby={
              hasError
                ? `${id}-error`
                : description
                ? `${id}-description`
                : undefined
            }
            aria-invalid={hasError}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </SelectPrimitive.Root>
        {description && !hasError && (
          <p
            id={`${id}-description`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <InfoCircledIcon className="h-3.5 w-3.5 flex-shrink-0" />
            {description}
          </p>
        )}
        {hasError && (
          <p
            id={`${id}-error`}
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <ExclamationTriangleIcon className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

// Componentes base
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

// SelectTrigger mejorado
interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  hasError?: boolean;
  showSuccess?: boolean;
  icon?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, hasError, showSuccess, icon, ...props }, ref) => {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-all duration-200",
        "data-[placeholder]:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        hasError
          ? "border-destructive/60 focus:ring-destructive/30"
          : showSuccess
          ? "border-success/60 focus:ring-success/30"
          : "border-input focus:border-primary/50",
        icon ? "pl-10" : "",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate text-left">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="h-4 w-4 opacity-70" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// SelectContent mejorado
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "origin-[--radix-select-content-transform-origin] border-border/50 bg-popover/95 backdrop-blur-sm",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1.5",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

// SelectItem mejorado
interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  icon?: React.ReactNode;
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, icon, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none",
      "focus:bg-accent/50 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "transition-colors duration-200",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckCircledIcon className="h-4 w-4 text-success" />
      </SelectPrimitive.ItemIndicator>
    </span>
    {icon && <span className="mr-2 text-muted-foreground">{icon}</span>}
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

// SelectLabel mejorado
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

// SelectSeparator mejorado
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted/50", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// SelectScrollUpButton mejorado
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUpIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

// SelectScrollDownButton mejorado
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDownIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

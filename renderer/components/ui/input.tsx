import * as React from "react"
import { cn } from "../../lib/utils"
import { Info, AlertCircle, CheckCircle2 } from "lucide-react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  success?: boolean
  icon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      description,
      error,
      success,
      icon,
      containerClassName,
      id: propId,
      ...props
    },
    ref
  ) => {
    // Generar un ID único si no se proporciona uno
    const id = React.useId()
    const inputId = propId || `input-${id}`
    const hasError = !!error
    const showSuccess = success && !hasError

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground/90"
          >
            {label}
            {props.required && (
              <span className="ml-0.5 text-destructive">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasError
                ? "border-destructive/60 focus-visible:ring-destructive/30"
                : showSuccess
                ? "border-success/60 focus-visible:ring-success/30"
                : "border-border focus:border-primary/50",
              icon ? "pl-10" : "",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : description
                ? `${inputId}-description`
                : undefined
            }
            ref={ref}
            {...props}
          />
          {showSuccess && (
            <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />
          )}
          {hasError && (
            <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
          )}
        </div>
        {description && !hasError && (
          <p
            id={`${inputId}-description`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Info className="h-3.5 w-3.5 flex-shrink-0" />
            {description}
          </p>
        )}
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

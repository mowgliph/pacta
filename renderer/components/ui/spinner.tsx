import { cn } from "../../lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Spinner de carga con diferentes tamaños
 * 
 * @param size - Tamaño del spinner (sm, md, lg, xl)
 * @param className - Clases adicionales de Tailwind
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  // Determinar tamaño del spinner
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4"
  };

  return (
    <div
      className={cn(
        "border-solid rounded-full animate-spin",
        "border-current border-r-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Cargando..."
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
} 
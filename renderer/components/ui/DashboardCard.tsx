import React from "react";
import { cn } from "../../lib/utils";

interface DashboardCardProps {
  title: string;
  count: number | string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
}

/**
 * Componente de tarjeta reutilizable para el dashboard
 * Muestra un contador, título y tendencia, y es clickeable para abrir un modal
 */
const DashboardCard = ({
  title,
  count,
  icon,
  color = "bg-primary",
  onClick,
  className,
  disabled = false,
  trend,
}: DashboardCardProps) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "group relative flex flex-col gap-4 bg-card rounded-lg border p-5 transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        disabled 
          ? "opacity-60 cursor-not-allowed" 
          : "cursor-pointer hover:shadow-md",
        className
      )}
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onClick && !disabled) {
          onClick();
        }
      }}
      aria-label={disabled ? `${title}: ${count} (No disponible)` : `${title}: ${count}`}
      aria-disabled={disabled}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {icon && (
          <div className="w-9 h-9 flex items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            {React.isValidElement(icon) ? (
              <div className="w-4 h-4 flex items-center justify-center">
                {icon}
              </div>
            ) : icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {count}
        </div>
        
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1",
            trend.positive 
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {trend.positive ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {trend.label}
          </div>
        )}
      </div>
      
      {!disabled && (
        <div className="absolute inset-0 rounded-lg ring-1 ring-transparent group-hover:ring-primary/20 transition-all pointer-events-none" />
      )}
    </div>
  );
};

export default DashboardCard;
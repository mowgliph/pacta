import React from "react";
import { cn } from "../../lib/utils";

interface DashboardCardProps {
  title: string;
  count: number | string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Componente de tarjeta reutilizable para el dashboard
 * Muestra un contador y título, y es clickeable para abrir un modal
 */
const DashboardCard = ({
  title,
  count,
  icon,
  color = "bg-[#018ABE]",
  onClick,
  className,
  disabled = false,
}: DashboardCardProps & { disabled?: boolean }) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "flex items-center gap-4 bg-white rounded-lg shadow-sm p-6 min-w-[220px] transition-all duration-200",
        disabled 
          ? "opacity-70 cursor-not-allowed" 
          : "cursor-pointer hover:scale-[1.03] hover:shadow-md",
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
      {icon && (
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-lg ${color} bg-opacity-10`}
        >
          {icon}
        </div>
      )}
      <div>
        <div className="text-xs text-[#757575] font-roboto mb-1">{title}</div>
        <div className="text-2xl font-semibold text-[#001B48] font-inter">
          {count}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;


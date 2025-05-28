import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface DashboardCardProps {
  title: string;
  count: number | string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
}

const DashboardCard = ({
  title,
  count,
  icon,
  onClick,
  className,
  disabled = false,
  loading = false,
  error = null,
  trend,
}: DashboardCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "relative overflow-hidden bg-white rounded-xl p-6",
        "border border-gray-100 shadow-sm",
        "hover:shadow-lg transition-all duration-200",
        disabled && "opacity-60 cursor-not-allowed hover:shadow-none",
        className
      )}
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? -1 : 0}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
            ) : error ? (
              <p className="text-sm text-red-500 mt-1 truncate" title={error}>
                Error
              </p>
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            )}
          </div>
          {icon && (
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm",
              trend.positive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            )}
          >
            <span>{trend.positive ? "↑" : "↓"}</span>
            {trend.value}%
            <span className="text-gray-500 text-xs">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardCard;

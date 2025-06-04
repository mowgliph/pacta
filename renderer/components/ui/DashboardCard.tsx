import React from "react";
import { cn } from "../../lib/utils";

type TrendVariant = 'up' | 'down' | 'neutral';

interface DashboardCardProps {
  title: string;
  count: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    variant?: TrendVariant;
  };
  loading?: boolean;
  error?: string | null;
  className?: string;
  onClick?: () => void;
}

const getTrendColors = (variant: TrendVariant = 'neutral') => {
  switch (variant) {
    case 'up':
      return 'bg-green-100 text-green-800';
    case 'down':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const DashboardCard = ({
  title,
  count,
  icon,
  trend,
  loading = false,
  error = null,
  className,
  onClick,
}: DashboardCardProps) => {
  const trendVariant: TrendVariant = trend?.variant || 'neutral';
  const trendColors = getTrendColors(trendVariant);
  const trendIcon = trendVariant === 'up' ? '↑' : trendVariant === 'down' ? '↓' : '→';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={onClick ? handleClick : undefined}
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm",
        "transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer hover:bg-gray-50 active:bg-gray-100",
        className
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as any);
        }
      } : undefined}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {title}
          </h3>
          {loading ? (
            <div className="h-12 w-24 bg-gray-100 rounded-lg animate-pulse" />
          ) : error ? (
            <p className="text-sm text-red-500">Error al cargar</p>
          ) : (
            <p className="text-3xl font-bold text-gray-800">
              {typeof count === 'number' ? count.toLocaleString() : count}
            </p>
          )}
        </div>
        
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          {React.isValidElement(icon) ? (
            React.cloneElement(icon as React.ReactElement, {
              className: 'w-5 h-5 text-blue-500',
              'aria-hidden': true
            } as React.HTMLAttributes<SVGElement>)
          ) : (
            <span className="text-blue-500">{icon}</span>
          )}
        </div>
      </div>

      {trend && !loading && !error && (
        <div className={cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md mt-4", trendColors)}>
          <span>{trendIcon} {Math.abs(Math.round(trend.value))}%</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;

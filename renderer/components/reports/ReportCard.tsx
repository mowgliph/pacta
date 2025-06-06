import { cn } from '@/lib/utils';
import { IconArrowDown, IconArrowUp, IconArrowRight } from '@tabler/icons-react';

interface ReportCardProps {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ReportCard({
  title,
  value,
  change = 0,
  description,
  icon,
  className = '',
}: ReportCardProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className={cn('bg-white rounded-lg shadow p-6', className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          
          {!isNeutral && (
            <div className={cn(
              'mt-2 inline-flex items-center text-sm',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {isPositive ? (
                <IconArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <IconArrowDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}% {isPositive ? 'aumento' : 'disminución'}
            </div>
          )}
          
          {isNeutral && change === 0 && (
            <div className="mt-2 inline-flex items-center text-sm text-gray-500">
              <IconArrowRight className="h-4 w-4 mr-1" />
              Sin cambios
            </div>
          )}
          
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
        
        {icon && (
          <div className="p-2 bg-gray-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

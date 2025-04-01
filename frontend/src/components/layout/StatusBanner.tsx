import React from 'react';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type StatusType = 'info' | 'success' | 'warning' | 'error';

type StatusBannerProps = {
  type?: StatusType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  type = 'info',
  title,
  message,
  action,
  onDismiss,
  className,
}) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <IconCheck className="h-5 w-5" />,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-500 dark:text-green-400',
          textColor: 'text-green-700 dark:text-green-300',
        };
      case 'warning':
        return {
          icon: <IconAlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-500 dark:text-yellow-400',
          textColor: 'text-yellow-700 dark:text-yellow-300',
        };
      case 'error':
        return {
          icon: <IconAlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-500 dark:text-red-400',
          textColor: 'text-red-700 dark:text-red-300',
        };
      case 'info':
      default:
        return {
          icon: <IconInfoCircle className="h-5 w-5" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-500 dark:text-blue-400',
          textColor: 'text-blue-700 dark:text-blue-300',
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor, textColor } = getStatusConfig();

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-sm animate-in fade-in duration-300',
        bgColor,
        borderColor,
        className
      )}
    >
      <div className={cn('mt-0.5', iconColor)}>{icon}</div>
      <div className="flex-1">
        <h3 className={cn('font-semibold', textColor)}>{title}</h3>
        {message && <p className={cn('mt-1 text-sm', textColor)}>{message}</p>}
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className={cn('mt-3', textColor, borderColor)}
          >
            {action.label}
          </Button>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 w-8 rounded-full p-0"
          aria-label="Cerrar"
        >
          <IconX className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}; 
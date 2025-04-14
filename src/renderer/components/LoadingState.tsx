import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/renderer/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando...',
  className,
  size = 'md',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-2',
    fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm',
    className
  );

  return (
    <div className={containerClasses} role="status">
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};

export default LoadingState;
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-2',
  };

  return (
    <div className={cn('inline-block', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-t-2 border-primary border-t-transparent',
          sizeClasses[size]
        )}
        role="status"
      >
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
}

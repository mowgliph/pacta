import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/renderer/components/ui/button';
import { cn } from '@/renderer/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ha ocurrido un error',
  message = 'No se pudo completar la operación solicitada.',
  onRetry,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-6 text-center', className)}>
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Intentar nuevamente
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
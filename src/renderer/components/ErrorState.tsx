import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = 'Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo.',
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <XCircle className="h-12 w-12 text-destructive" />
      <p className="text-destructive font-medium">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Reintentar
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
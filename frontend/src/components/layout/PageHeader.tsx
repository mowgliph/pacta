import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { IconArrowLeft } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  backButton?: boolean;
  backPath?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backButton = false,
  backPath = '',
  actions,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate({ to: backPath });
    } else {
      window.history.back();
    }
  };

  return (
    <div className={cn('mb-6 flex flex-col space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 mr-2"
              aria-label="Volver"
            >
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}; 